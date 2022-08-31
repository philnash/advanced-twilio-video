import {
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteAudioTrack,
  RemoteVideoTrack,
  LocalTrack,
  RemoteTrack,
} from "twilio-video";

/**
 * @typedef {Object} MediaDevice
 * @property {string} value
 * @property {string} label
 */

/**
 * @param {string} labelText
 * @param {Array<MediaDevice>} options
 * @param {*} selected
 * @returns
 */
export function buildDropDown(labelText, options, selected) {
  const label = document.createElement("label");
  label.appendChild(document.createTextNode(labelText));
  const select = document.createElement("select");
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.setAttribute("value", opt.value);
    if (opt.label === selected) {
      option.setAttribute("selected", "selected");
    }
    option.appendChild(document.createTextNode(opt.label));
    select.appendChild(option);
  });
  label.appendChild(select);
  return label;
}

/**
 * @param {HTMLDivElement} div
 * @param {LocalTrack|RemoteTrack} track
 * @returns HTMLMediaElement | undefined
 */
export function attachTrack(div, track) {
  if ("attach" in track) {
    const mediaElement = track.attach();
    div.appendChild(mediaElement);
    return mediaElement;
  }
}

/**
 * @param {LocalVideoTrack|LocalAudioTrack} track
 * @returns void
 */
export function detachTrack(track) {
  track.detach().forEach((mediaElement) => {
    mediaElement.remove();
  });
}

export function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.src = url;
  });
}
