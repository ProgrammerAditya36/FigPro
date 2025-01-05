'use client';

import { ReactNode } from 'react';
import {
	LiveblocksProvider,
	RoomProvider,
	ClientSideSuspense,
} from '@liveblocks/react/suspense';

export function Room({ children }: { children: ReactNode }) {
	const key = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY as string;
	return (
		<LiveblocksProvider publicApiKey={key}>
			<RoomProvider id="my-room">
				<ClientSideSuspense fallback={<div>Loading…</div>}>
					{children}
				</ClientSideSuspense>
			</RoomProvider>
		</LiveblocksProvider>
	);
}
