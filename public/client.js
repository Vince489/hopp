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
        
        // Display local stream
        const audioElement = new Audio();
        audioElement.srcObject = localStream;
        audioElement.play();
        
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
            const remoteAudio = document.createElement('audio');
            remoteAudio.srcObject = new MediaStream([event.track]);
            remoteAudio.play();
            document.body.appendChild(remoteAudio);
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
    peerConnection.close();
}


