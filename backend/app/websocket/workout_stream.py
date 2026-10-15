import time
import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket.connection_manager import manager
from app.vision.pose_engine import PoseEngine
from app.exercises.registry import create_exercise_analyzer
from app.coaching.coach import AICoach

router = APIRouter()
logger = logging.getLogger("formiq.websocket")

@router.websocket("/ws/workout/{workout_id}")
async def websocket_workout_endpoint(
    websocket: WebSocket,
    workout_id: int,
    exercise: str = Query("squat")
):
    await manager.connect(workout_id, websocket)
    
    # Initialize exercise analyzer & coach for this session
    try:
        analyzer = create_exercise_analyzer(exercise)
    except Exception as e:
        logger.error(f"Failed to create analyzer for {exercise}: {e}")
        analyzer = create_exercise_analyzer("squat")

    coach = AICoach(speech_cooldown_seconds=5.5)
    pose_engine = PoseEngine.get_instance()

    try:
        # Acknowledge connection
        await manager.send_json(websocket, {
            "type": "SESSION_INITIALIZED",
            "workout_id": workout_id,
            "exercise": exercise,
            "status": "ready"
        })

        while True:
            # Receive frame or event packet from client
            raw_text = await websocket.receive_text()
            data = json.loads(raw_text)

            msg_type = data.get("type", "FRAME")
            timestamp = data.get("timestamp", time.time())

            if msg_type == "PING":
                await manager.send_json(websocket, {"type": "PONG"})
                continue

            if msg_type == "MANUAL_REP":
                delta = int(data.get("delta", 1))
                analyzer.rep_count = max(0, getattr(analyzer, "rep_count", 0) + delta)
                await manager.send_json(websocket, {
                    "type": "POSE_UPDATE",
                    "detected": True,
                    "reps": analyzer.rep_count,
                    "phase": getattr(analyzer, "state", "START"),
                    "form_score": getattr(analyzer, "latest_form_score", 90),
                    "metrics": getattr(analyzer, "latest_metrics", {}),
                    "landmarks": []
                })
                continue

            if msg_type in ("RESET", "RESET_SET"):
                if hasattr(analyzer, "reset"):
                    analyzer.reset()
                analyzer.rep_count = 0
                await manager.send_json(websocket, {
                    "type": "POSE_UPDATE",
                    "detected": True,
                    "reps": 0,
                    "phase": "START",
                    "form_score": getattr(analyzer, "latest_form_score", 90),
                    "metrics": getattr(analyzer, "latest_metrics", {}),
                    "landmarks": []
                })
                continue

            # Process image frame
            frame_data = data.get("frame")
            client_landmarks = data.get("landmarks")  # Support direct landmark streaming if frontend runs client landmarker
            
            landmarks_dict = {}
            visibilities_dict = {}
            raw_landmarks_list = []
            detected = False

            if client_landmarks and isinstance(client_landmarks, list) and len(client_landmarks) > 0:
                # Fast client-side landmark stream
                detected = True
                raw_landmarks_list = client_landmarks
                for idx, lm in enumerate(client_landmarks):
                    landmarks_dict[idx] = (float(lm["x"]), float(lm["y"]), float(lm.get("z", 0.0)))
                    visibilities_dict[idx] = float(lm.get("visibility", 1.0))
            elif frame_data:
                # Server-side MediaPipe Pose Landmarker detection
                pose_result, _ = pose_engine.process_base64_image(frame_data)
                detected = pose_result.get("detected", False)
                if detected:
                    landmarks_dict = pose_result.get("landmarks", {})
                    visibilities_dict = pose_result.get("visibilities", {})
                    raw_landmarks_list = pose_result.get("raw_landmarks_list", [])

            if not detected:
                await manager.send_json(websocket, {
                    "type": "POSE_UPDATE",
                    "detected": False,
                    "reps": analyzer.rep_count,
                    "phase": analyzer.state,
                    "message": "Athlete not detected in frame. Step back into full view.",
                    "metrics": analyzer.latest_metrics,
                    "form_score": analyzer.latest_form_score,
                    "landmarks": []
                })
                continue

            # Evaluate Biomechanics & State Machine
            eval_result = analyzer.evaluate_frame(
                raw_landmarks=landmarks_dict,
                visibilities=visibilities_dict,
                timestamp=timestamp
            )

            metrics = eval_result.get("metrics") or eval_result
            completed_rep = eval_result.get("completed_rep") or eval_result.get("completed_rep_data")
            reps_count = eval_result.get("reps", getattr(analyzer, "rep_count", 0))
            phase = eval_result.get("phase", getattr(analyzer, "state", "START"))

            # AI Coach evaluation
            structured_event = {
                "exercise": exercise,
                "rep": reps_count,
                "form_score": metrics.get("form_score", 90),
                "depth": metrics.get("depth_status", "GOOD"),
                "knee_alignment": metrics.get("knee_alignment", "GOOD"),
                "back_angle": metrics.get("back_angle", "GOOD"),
                "violations": metrics.get("active_violations", []),
                "is_rep_completed": completed_rep is not None
            }

            coaching_cue = await coach.get_live_coaching(structured_event)

            # Broadcast response back to frontend
            response_packet = {
                "type": "POSE_UPDATE",
                "detected": True,
                "reps": reps_count,
                "phase": phase,
                "metrics": metrics,
                "form_score": metrics.get("form_score", 90),
                "completed_rep": completed_rep,
                "coaching": coaching_cue,
                "landmarks": raw_landmarks_list,
                "timestamp": timestamp
            }

            await manager.send_json(websocket, response_packet)

    except WebSocketDisconnect:
        manager.disconnect(workout_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error in workout {workout_id}: {e}")
        manager.disconnect(workout_id, websocket)
