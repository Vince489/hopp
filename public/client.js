const socket = io(); 

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let localStream;
let peerConnection;

startButton.addEventListener('click', start);
stopButton.addEventListener('click', stop);

async function start() {
    try {
        startButton.disabled = true;
        stopButton.disabled = false;

        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        // Create peer connection
        peerConnection = new RTCPeerConnection();
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Listen for ICE candidates
        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        });

        // Listen for remote tracks
        peerConnection.addEventListener('track', event => {
            const remoteAudio = document.getElementById('remoteAudio');
            if (!remoteAudio.srcObject) {
                remoteAudio.srcObject = new MediaStream();
            }
            remoteAudio.srcObject.addTrack(event.track);
        });

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send offer to peer
        socket.emit('offer', offer);
    } catch (error) {
        console.error('Error starting:', error);
    }
}

function stop() {
    startButton.disabled = false;
    stopButton.disabled = true;

    // Stop local stream
    localStream.getTracks().forEach(track => track.stop());

    // Close peer connection
    if (peerConnection) {
        peerConnection.close();
    }
}
