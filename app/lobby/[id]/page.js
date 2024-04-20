"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";
import { useRouter, useParams } from "next/navigation";

export default function Home() {
    const [lobbyID, setLobbyID] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState(["Joe"]);
    const [username, setUsername] = useState();
    const [lobbyExists, setLobbyExists] = useState(true); //chnage to empty after testing
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [qrCode, setQrCode] = useState();
    
    const router = useRouter();
    const params = useParams();

    function joinLobby() {
        // todo: check if username is already taken
        socket.emit("joinLobby", username, params.id);
        socket.on('lobbyJoined', (data) => {
            console.log("joined lobby")
            setJoinedLobby(true);
        });
    }

    
    useEffect(() => {
        function checkIfLobbyIdValid() {
            console.log(params.id);
            socket.emit("checkLobbyExists", params.id);
            socket.on('lobbyFound', (data) => {
                console.log(`received value ${data} after checking if lobby exists`);
                // CHANGE THIS TO DATA AFTER TESTING
                setLobbyExists(true);
            })
        }

        async function generateQrCode() {
            const response = await fetch("http://localhost:3000/api/qr", {
                "body": JSON.stringify({ domain: window.location.href }),
                "method": "POST"
            });
            let data = await response.json();
            console.log("full response is", data);
            const svgLink = data.imageUrl;
            console.log(svgLink);
            setQrCode(svgLink);
        }
        
        // Set up the 'lobbyUpdate' event listener
        const handleLobbyUpdate = (data) => {
            console.log("received update", data);
            setConnectedUsers(data);
        };

        checkIfLobbyIdValid();
        generateQrCode();

        socket.on("lobbyUpdate", handleLobbyUpdate);

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off("lobbyUpdate", handleLobbyUpdate);
        };
    }, []);

    return (
        <div className="grow min-h-screen flex-col bg-gray-100">   
            {lobbyExists
                ? <div className="flex flex-col items-center">
                    {!joinedLobby && (
                        <div className="row mt-3 mb-80">
                            <input placeholder='username' onChange={(e) => setUsername(e.target.value)}></input>
                            <button className="btn" onClick={joinLobby}>join lobby</button>
                        </div>
                    )}
                    <div className="flex flex-col items-center max-w-[80vw] min-w-[50vw] overflow-x-scroll bg-gray-200">
                        <div className="text-black flex flex-row items-center ml-auto mr-auto">
                            {connectedUsers.map((user, index) => (
                                <div key={index} className="w-80 h-96 m-3 rounded-md flex flex-row items-center bg-gray-50">
                                    {user}
                                </div>
                                ))}
                        </div>
                    </div>
                    {qrCode && (
                        <div>
                            <img src={qrCode} alt='qr code' height={200} width={200} />
                        </div>
                    )}
                </div>
                : <div>
                    <p>that lobby id does not exist</p>
                </div>
            }
        </div>
    );
}