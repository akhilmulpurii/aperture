import React, { useState } from 'react';
import { JellyfinPlayer } from '../playback/components/JellyfinPlayer';
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

export default function PlaybackTestPage() {
    const [itemId, setItemId] = useState('1492619afe008ef7a1ae79f51a567eb5');
    const [serverUrl, setServerUrl] = useState('https://sam-jf.duckdns.org');
    const [itemType, setItemType] = useState('Movie');
    const [activeItem, setActiveItem] = useState<BaseItemDto | null>(null);
    const [playOptions, setPlayOptions] = useState<any>({});

    const handlePlay = () => {
        if (!itemId) return;
        
        const url = `${serverUrl}/Videos/${itemId}/stream?static=true`; // Simple static stream URL
        
        setPlayOptions({ url });
        setActiveItem({
            Id: itemId,
            MediaType: itemType as any,
            Name: 'Test Media',
            RunTimeTicks: 10 * 60 * 10000000, // 10 mins
        });
    };


    return (
        <div className="p-8 space-y-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold">Playback Verification</h1>
            
            <div className="flex gap-4 items-end bg-gray-800 p-4 rounded-lg flex-wrap">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400">Server URL</label>
                    <input 
                        className="bg-gray-700 p-2 rounded w-64 text-white" 
                        value={serverUrl} 
                        onChange={e => setServerUrl(e.target.value)}
                        placeholder="http://localhost:8096"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400">Item ID</label>
                    <input 
                        className="bg-gray-700 p-2 rounded w-64 text-white" 
                        value={itemId} 
                        onChange={e => setItemId(e.target.value)}
                        placeholder="e.g. 1928374"
                    />
                </div>
                
                <div className="flex flex-col">
                     <label className="text-sm text-gray-400">Type</label>
                     <select 
                        className="bg-gray-700 p-2 rounded text-white"
                        value={itemType}
                        onChange={e => setItemType(e.target.value)}
                     >
                         <option value="Movie">Movie</option>
                         <option value="Episode">Episode</option>
                         <option value="Audio">Audio</option>
                         <option value="Video">Video</option>
                     </select>
                </div>

                <button 
                    onClick={handlePlay}
                    className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 transition"
                >
                    Load in Player
                </button>
            </div>

            <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                <JellyfinPlayer 
                    item={activeItem || undefined}
                    options={playOptions}
                    className="w-full h-full"
                />
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-bold mb-2">Instructions</h3>
                <ol className="list-decimal pl-5 space-y-1 text-gray-300">
                    <li>Enter a valid Item ID from your Jellyfin server.</li>
                    <li>Select the correct Media Type.</li>
                    <li>Click "Load in Player".</li>
                    <li>Verify:
                        <ul className="list-disc pl-5 mt-1 text-gray-400">
                            <li>Video/Audio loads and plays.</li>
                            <li>Controls (Play/Pause, Seek, Volume) work.</li>
                            <li>HLS is used if supported/needed (check network tab).</li>
                        </ul>
                    </li>
                </ol>
            </div>
        </div>
    );
}
