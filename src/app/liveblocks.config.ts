import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
console.log(process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY);

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY || "",
});

// Presence represents the properties that will exist on every User in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  position: { x: number; y: number } | null;
  character: string | null;
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all Users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  // animals: LiveList<string>,
  // ...
};

// Optionally, the type of custom events broadcasted and listened for in this
// room. Must be JSON-serializable.
// type RoomEvent = {};

export const {
  RoomProvider,
  useMyPresence,
  useObject,
  useOthers,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage /* UserMeta, RoomEvent */>(client);
