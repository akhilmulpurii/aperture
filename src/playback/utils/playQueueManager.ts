import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

// Define a simple Playlist Item interface if not available from SDK
export interface PlaylistItem extends BaseItemDto {
    PlaylistItemId?: string;
}

let currentId = 0;
function addUniquePlaylistItemId(item: PlaylistItem) {
    if (!item.PlaylistItemId) {
        item.PlaylistItemId = 'playlistItem' + currentId;
        currentId++;
    }
}

function findPlaylistIndex(playlistItemId: string | null | undefined, list: PlaylistItem[]) {
    if (!playlistItemId) return -1;
    for (let i = 0, length = list.length; i < length; i++) {
        if (list[i].PlaylistItemId === playlistItemId) {
            return i;
        }
    }
    return -1;
}

export type RepeatMode = 'RepeatOne' | 'RepeatAll' | 'RepeatNone';
export type ShuffleMode = 'Shuffle' | 'Sorted';

export class PlayQueueManager {
    private _sortedPlaylist: PlaylistItem[] = [];
    private _playlist: PlaylistItem[] = [];
    private _repeatMode: RepeatMode = 'RepeatNone';
    private _shuffleMode: ShuffleMode = 'Sorted';
    private _currentPlaylistItemId: string | null = null;

    getPlaylist(): PlaylistItem[] {
        return this._playlist.slice(0);
    }

    setPlaylist(items: PlaylistItem[]) {
        const newItems = items.slice(0);
        for (let i = 0, length = newItems.length; i < length; i++) {
            addUniquePlaylistItemId(newItems[i]);
        }
        this._currentPlaylistItemId = null;
        this._playlist = newItems;
        this._repeatMode = 'RepeatNone';
    }

    queue(items: PlaylistItem[]) {
        for (let i = 0, length = items.length; i < length; i++) {
            addUniquePlaylistItemId(items[i]);
            this._playlist.push(items[i]);
        }
    }

    queueNext(items: PlaylistItem[]) {
        for (let i = 0, length = items.length; i < length; i++) {
            addUniquePlaylistItemId(items[i]);
        }

        let currentIndex = this.getCurrentPlaylistIndex();
        if (currentIndex === -1) {
            currentIndex = this._playlist.length;
        } else {
            currentIndex++;
        }
        
        // Insert items at currentIndex
        this._playlist.splice(currentIndex, 0, ...items);
    }

    getCurrentPlaylistIndex(): number {
        return findPlaylistIndex(this.getCurrentPlaylistItemId(), this._playlist);
    }

    getCurrentItem(): PlaylistItem | null {
        const index = findPlaylistIndex(this.getCurrentPlaylistItemId(), this._playlist);
        return index === -1 ? null : this._playlist[index];
    }

    getCurrentPlaylistItemId(): string | null {
        return this._currentPlaylistItemId;
    }

    setPlaylistState(playlistItemId: string | null) {
        this._currentPlaylistItemId = playlistItemId;
    }

    setPlaylistIndex(playlistIndex: number) {
        if (playlistIndex < 0 || playlistIndex >= this._playlist.length) {
            this.setPlaylistState(null);
        } else {
            this.setPlaylistState(this._playlist[playlistIndex].PlaylistItemId || null);
        }
    }
    
    getNextItemInfo(): { item: PlaylistItem, index: number } | null {
        let newIndex: number;
        const playlist = this.getPlaylist();
        const playlistLength = playlist.length;

        if (playlistLength === 0) return null;

        const currentIndex = this.getCurrentPlaylistIndex();

        switch (this._repeatMode) {
            case 'RepeatOne':
                newIndex = currentIndex;
                break;
            case 'RepeatAll':
                newIndex = currentIndex + 1;
                if (newIndex >= playlistLength) {
                    newIndex = 0;
                }
                break;
            default:
                newIndex = currentIndex + 1;
                break;
        }

        if (newIndex < 0 || newIndex >= playlistLength) {
            return null;
        }

        const item = playlist[newIndex];
        if (!item) {
            return null;
        }

        return {
            item: item,
            index: newIndex
        };
    }
    
    // Simplified shuffle/sort for migration for now, can be expanded
    setRepeatMode(value: RepeatMode) {
        this._repeatMode = value;
    }

    getRepeatMode() {
        return this._repeatMode;
    }
}
