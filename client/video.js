const {
  createLocalAudioTrack,
  createLocalTracks,
  createLocalVideoTrack,
  LocalAudioTrack,
  LocalVideoTrack,
  connect,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} = Twilio.Video;
import { buildDropDown, attachTrack, detachTrack, loadImage } from "./utils";
import { testAudioInputDevice, AudioInputTest } from "@twilio/rtc-diagnostics";

const loadingDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("loading")
);
const loginDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("login")
);
const loginForm = /** @type {HTMLFormElement} */ (
  document.getElementById("login-form")
);
const loginButton = /** @type {HTMLButtonElement} */ (
  loginForm.querySelector("button")
);
const identityInput = /** @type {HTMLInputElement} */ (
  document.getElementById("identity")
);
const localPreview = /** @type {HTMLDivElement} */ (
  document.getElementById("local-preview")
);
const videoPreviewDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("video-preview")
);
const cameraSelectorDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("camera-selector")
);
const micSelectorDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("mic-selector")
);
const joinRoomForm = /** @type {HTMLFormElement} */ (
  document.getElementById("join-room")
);
const roomInput = /** @type {HTMLInputElement} */ (
  document.getElementById("roomName")
);
const chatDiv = /** @type {HTMLDivElement} */ (document.getElementById("chat"));
const localParticipantDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("local-participant")
);
const remoteParticipantDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("remote-participant")
);
const roomNameSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("room")
);
const usernameSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("username")
);
const muteBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("mute-button")
);
const disconnectBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("disconnect-button")
);
const videoEffects = /** @type {HTMLDivElement} */ (
  document.getElementById("video-effects")
);
const noiseCancellationButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("noise-cancellation")
);
const volumeMeter = /** @type {HTMLMeterElement} */ (
  document.getElementById("volume-meter")
);

/**
 *
 * @param {HTMLDivElement} participantDiv
 * @returns {(trackPublication: RemoteTrackPublication|RemoteTrackPublication) => void}
 */
function trackPublished(participantDiv) {
  /**
   * @param {RemoteTrackPublication} trackPublication
   */
  return function (trackPublication) {
    if (trackPublication.track) {
      trackSubscribed(participantDiv)(trackPublication.track);
    } else {
      trackPublication.on("subscribed", trackSubscribed(participantDiv));
    }
  };
}

/**
 *
 * @param {HTMLDivElement} participantDiv
 * @returns {(track: RemoteTrack) => void}
 */
function trackSubscribed(participantDiv) {
  return function (track) {
    attachTrack(participantDiv, track);
  };
}

/**
 *
 * @param {HTMLDivElement} participantDiv
 * @returns {(participant: RemoteParticipant) => void}
 */
function addParticipant(participantDiv) {
  return function (participant) {
    participant.tracks.forEach(trackPublished(participantDiv));
  };
}

/**
 *
 * @param {HTMLDivElement} participantDiv
 * @returns void
 */
function removeParticipant(participantDiv) {
  participantDiv.replaceChildren();
}
let blur, bgReplace, audioTest;

function ready() {
  if (blur && bgReplace) {
    videoEffects.removeAttribute("hidden");
    loadingDiv.setAttribute("hidden", "hidden");
    loginDiv.removeAttribute("hidden");
  }
}

window.addEventListener("load", async () => {
  import("@twilio/video-processors").then((VideoProcessors) => {
    if (VideoProcessors.isSupported) {
      const blurredBackground =
        new VideoProcessors.GaussianBlurBackgroundProcessor({
          assetsPath: "/tf",
          maskBlurRadius: 10,
          blurFilterRadius: 5,
        });
      blurredBackground.loadModel().then(() => {
        blur = blurredBackground;
        ready();
      });

      loadImage("/images/background.jpg").then((img) => {
        const imageBackground = new VideoProcessors.VirtualBackgroundProcessor({
          assetsPath: "/tf",
          backgroundImage: img,
          maskBlurRadius: 5,
        });
        imageBackground.loadModel().then(() => {
          bgReplace = imageBackground;
          ready();
        });
      });
    } else {
      loadingDiv.setAttribute("hidden", "hidden");
      loginDiv.removeAttribute("hidden");
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginButton.setAttribute("disabled", "disabled");
    const identity = identityInput.value;
    const tracks = await createLocalTracks({
      video: {
        name: "user-camera",
        facingMode: "user",
      },
      audio: {
        name: "user-audio",
        noiseCancellationOptions: {
          sdkAssetsPath: "/krisp",
          vendor: "krisp",
        },
      },
    });
    let videoTrack = /** @type {LocalVideoTrack} */ (
      tracks.find((track) => track.kind === "video")
    );
    let audioTrack = /** @type {LocalAudioTrack} */ (
      tracks.find((track) => track.kind === "audio")
    );
    if (
      audioTrack.noiseCancellation &&
      !audioTrack.noiseCancellation.isEnabled
    ) {
      noiseCancellationButton.setAttribute("hidden", "hidden");
    }
    window.audioTrack = audioTrack;
    let videoPreview = attachTrack(videoPreviewDiv, videoTrack);

    loginDiv.setAttribute("hidden", "hidden");
    localPreview.removeAttribute("hidden");

    if (videoPreview) videoPreview.play();

    const devices = await navigator.mediaDevices.enumerateDevices();
    const deviceToOption = (device) => ({
      value: device.deviceId,
      label: device.label,
    });
    const videoDevices = devices
      .filter((device) => device.kind === "videoinput")
      .map(deviceToOption);
    const audioDevices = devices
      .filter((device) => device.kind === "audioinput")
      .map(deviceToOption);
    const videoSelect = buildDropDown(
      "Choose camera",
      videoDevices,
      videoTrack.mediaStreamTrack.label
    );
    const audioSelect = buildDropDown(
      "Choose microphone",
      audioDevices,
      audioTrack.mediaStreamTrack.label
    );
    videoSelect.addEventListener("change", async (event) => {
      const select = /** @type HTMLSelectElement */ (event.target);
      const videoDevice = select.value;
      videoTrack.stop();
      detachTrack(videoTrack);
      videoTrack = await createLocalVideoTrack({
        deviceId: { exact: videoDevice },
      });
      if (currentVideoEffect) {
        videoTrack.addProcessor(currentVideoEffect);
      }
      videoPreview = attachTrack(videoPreviewDiv, videoTrack);
      if (videoPreview) videoPreview.play();
    });

    audioSelect.addEventListener("change", async (event) => {
      const select = /** @type HTMLSelectElement */ (event.target);
      const audioDevice = select.value;
      if (audioTest) {
        audioTest.stop();
      }
      audioTrack.stop();
      detachTrack(audioTrack);
      audioTrack = await createLocalAudioTrack({
        deviceId: { exact: audioDevice },
        noiseCancellationOptions: {
          sdkAssetsPath: "/krisp",
          vendor: "krisp",
        },
      });
      window.audioTrack = audioTrack;
      audioTest = testAudioInputDevice({
        deviceId: audioDevice,
      });
      audioTest.on(AudioInputTest.Events.Volume, (volume) => {
        volumeMeter.value = volume;
      });
    });
    cameraSelectorDiv.appendChild(videoSelect);
    micSelectorDiv.appendChild(audioSelect);

    audioTest = testAudioInputDevice();

    audioTest.on(AudioInputTest.Events.Volume, (volume) => {
      volumeMeter.value = volume;
    });
    window.audioTest = audioTest;

    let currentVideoEffect = null;

    videoEffects.addEventListener("change", (event) => {
      const radioButton = /** @type HTMLInputElement */ (event.target);
      if (currentVideoEffect && videoTrack) {
        videoTrack.removeProcessor(currentVideoEffect);
        currentVideoEffect = null;
      }
      if (radioButton.value === "blur") {
        videoTrack.addProcessor(blur);
        currentVideoEffect = blur;
      }
      if (radioButton.value === "image") {
        videoTrack.addProcessor(bgReplace);
        currentVideoEffect = bgReplace;
      }
    });

    joinRoomForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const roomName = roomInput.value;

      localPreview.setAttribute("hidden", "hidden");
      roomNameSpan.innerHTML = roomName;
      usernameSpan.innerHTML = identity;
      attachTrack(localParticipantDiv, videoTrack);
      chatDiv.removeAttribute("hidden");

      const tokenUrl = /** @type {string} */ (
        joinRoomForm.getAttribute("action")
      );
      const method = /** @type {string} */ (
        joinRoomForm.getAttribute("method")
      );
      try {
        const { token } = await fetch(tokenUrl, {
          method,
          body: JSON.stringify({
            identity,
            room: roomName,
          }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
        const room = await connect(token, {
          tracks: [videoTrack, audioTrack],
          name: roomName,
        });
        if (
          audioTrack.noiseCancellation &&
          !audioTrack.noiseCancellation.isEnabled
        ) {
          noiseCancellationButton.setAttribute("hidden", "hidden");
        }
        room.participants.forEach(addParticipant(remoteParticipantDiv));
        room.on("participantConnected", addParticipant(remoteParticipantDiv));
        room.on("participantDisconnected", () => {
          removeParticipant(remoteParticipantDiv);
        });
        room.on("disconnected", () => {
          removeParticipant(remoteParticipantDiv);
          detachTrack(videoTrack);
          room.removeAllListeners();
          attachTrack(videoPreviewDiv, videoTrack);
          chatDiv.setAttribute("hidden", "hidden");
          localPreview.removeAttribute("hidden");
        });

        function toggleMute() {
          if (muteBtn.textContent === "Mute") {
            audioTrack.disable();
            muteBtn.textContent = "Unmute";
          } else {
            audioTrack.enable();
            muteBtn.textContent = "Mute";
          }
        }
        muteBtn.addEventListener("click", toggleMute);

        function disconnectRoom() {
          room.disconnect();
        }
        disconnectBtn.addEventListener("click", disconnectRoom);

        function toggleNoiseCancellation() {
          if (
            noiseCancellationButton.textContent === "Disable noise cancellation"
          ) {
            audioTrack.noiseCancellation.disable();
            noiseCancellationButton.textContent = "Enable noise cancellation";
          } else {
            audioTrack.noiseCancellation.enable();
            noiseCancellationButton.textContent = "Disable noise cancellation";
          }
        }
        noiseCancellationButton.addEventListener(
          "click",
          toggleNoiseCancellation
        );
        /**
         *
         * @param {PageTransitionEvent | BeforeUnloadEvent} event
         * @returns void
         */
        function tidyUp(event) {
          if ("persisted" in event && event.persisted) return;
          if (this.room) room.disconnect();
          window.removeEventListener("beforeunload", tidyUp);
          window.removeEventListener("pagehide", tidyUp);
        }
        window.addEventListener("beforeunload", tidyUp);
        window.addEventListener("pagehide", tidyUp);
      } catch (error) {
        console.error(error);
        detachTrack(videoTrack);
        attachTrack(videoPreviewDiv, videoTrack);
        chatDiv.setAttribute("hidden", "hidden");
        localPreview.removeAttribute("hidden");
      }
    });
  });
});
