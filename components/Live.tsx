'use client';

import { useCallback, useEffect, useState } from 'react';

import { useMyPresence, useOthers } from '@/liveblocks.config';
import { CursorMode, CursorState } from '@/types/type';
import CursorChat from './cursor/CursorChat';
import LiveCursors from './cursor/LiveCursors';

type Props = {
	canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
	undo: () => void;
	redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
	/**
	 * useOthers returns the list of other users in the room.
	 *
	 * useOthers: https://liveblocks.io/docs/api-reference/liveblocks-react#useOthers
	 */
	const others = useOthers();

	/**
	 * useMyPresence returns the presence of the current user in the room.
	 * It also returns a function to update the presence of the current user.
	 *
	 * useMyPresence: https://liveblocks.io/docs/api-reference/liveblocks-react#useMyPresence
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [{ cursor }, updateMyPresence] = useMyPresence() as any;

	/**
	 * useBroadcastEvent is used to broadcast an event to all the other users in the room.
	 *
	 * useBroadcastEvent: https://liveblocks.io/docs/api-reference/liveblocks-react#useBroadcastEvent
	 */

	// store the reactions created on mouse click

	// track the state of the cursor (hidden, chat, reaction, reaction selector)
	const [cursorState, setCursorState] = useState<CursorState>({
		mode: CursorMode.Hidden,
	});

	// set the reaction of the cursor

	// Remove reactions that are not visible anymore (every 1 sec)

	// Broadcast the reaction to other users (every 100ms)

	/**
	 * useEventListener is used to listen to events broadcasted by other
	 * users.
	 *
	 * useEventListener: https://liveblocks.io/docs/api-reference/liveblocks-react#useEventListener
	 */

	// Listen to keyboard events to change the cursor state
	useEffect(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === '/') {
				setCursorState({
					mode: CursorMode.Chat,
					previousMessage: null,
					message: '',
				});
			} else if (e.key === 'Escape') {
				updateMyPresence({ message: '' });
				setCursorState({ mode: CursorMode.Hidden });
			} else if (e.key === 'e') {
				setCursorState({ mode: CursorMode.ReactionSelector });
			}
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === '/') {
				e.preventDefault();
			}
		};

		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [updateMyPresence]);

	// Listen to mouse events to change the cursor state
	const handlePointerMove = useCallback((event: React.PointerEvent) => {
		event.preventDefault();

		// if cursor is not in reaction selector mode, update the cursor position
		if (
			cursor == null ||
			cursorState.mode !== CursorMode.ReactionSelector
		) {
			// get the cursor position in the canvas
			const x =
				event.clientX - event.currentTarget.getBoundingClientRect().x;
			const y =
				event.clientY - event.currentTarget.getBoundingClientRect().y;

			// broadcast the cursor position to other users
			updateMyPresence({
				cursor: {
					x,
					y,
				},
			});
		}
	}, []);

	// Hide the cursor when the mouse leaves the canvas
	const handlePointerLeave = useCallback(() => {
		setCursorState({
			mode: CursorMode.Hidden,
		});
		updateMyPresence({
			cursor: null,
			message: null,
		});
	}, []);

	// Show the cursor when the mouse enters the canvas
	const handlePointerDown = useCallback(
		(event: React.PointerEvent) => {
			// get the cursor position in the canvas
			const x =
				event.clientX - event.currentTarget.getBoundingClientRect().x;
			const y =
				event.clientY - event.currentTarget.getBoundingClientRect().y;

			updateMyPresence({
				cursor: {
					x,
					y,
				},
			});

			// if cursor is in reaction mode, set isPressed to true
			setCursorState((state: CursorState) =>
				cursorState.mode === CursorMode.Reaction
					? { ...state, isPressed: true }
					: state
			);
		},
		[cursorState.mode, setCursorState]
	);

	// hide the cursor when the mouse is up
	const handlePointerUp = useCallback(() => {
		setCursorState((state: CursorState) =>
			cursorState.mode === CursorMode.Reaction
				? { ...state, isPressed: false }
				: state
		);
	}, [cursorState.mode, setCursorState]);

	// trigger respective actions when the user clicks on the right menu

	return (
		<div
			className="relative flex h-full w-full flex-1 items-center justify-center"
			id="canvas"
			style={{
				cursor: cursorState.mode === CursorMode.Chat ? 'none' : 'auto',
			}}
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
		>
			<canvas ref={canvasRef} />

			{/* Render the reactions */}

			{/* If cursor is in chat mode, show the chat cursor */}
			{cursor && (
				<CursorChat
					cursor={cursor}
					cursorState={cursorState}
					setCursorState={setCursorState}
					updateMyPresence={updateMyPresence}
				/>
			)}

			{/* If cursor is in reaction selector mode, show the reaction 

        {/* Show the live cursors of other users */}
			<LiveCursors others={others} />

			{/* Show the comments */}
		</div>
	);
};

export default Live;
