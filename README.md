# Advanced Twilio Video

This project is an example of a [Twilio Video](https://www.twilio.com/docs/video) application using advanced features to improve the experience for users connecting through it.

* [Features](#features)
  * [Pre-call A/V checks](#pre-call-av-checks)
  * [Video Backgrounds](#video-backgrounds)
  * [Noise cancellation](#noise-cancellation)
* [Running this project](#running-this-project)

## Features

### Pre-call A/V checks

Rather than dropping a user straight into a room, they are shown a settings page that allows them to see and change their camera, check that their microphone is correct and working using the Twilio RTC Diagnostics library.

Ensuring that users understand the resources that they are using, and their connectivity, improves the expectations in a call and leads to fewer issues with getting the wrong camera or microphone, or being on mute.

* [How to switch cameras in a video chat](https://www.twilio.com/blog/2018/06/switching-cameras-twilio-video-chat.html)
* The open source [Twilio RTC Diagnostics library](https://github.com/twilio/rtc-diagnostics)
* [Example WebRTC Diagnostics application](https://github.com/twilio/twilio-video-diagnostics-react-app)
* The [Twilio Video Preflight API](https://www.twilio.com/docs/video/troubleshooting/preflight-api)

### Video Backgrounds

Because Video calls can be taken anywhere, providing privacy for your users is important. Using Twilio Video's processors, we can provide background blurring or background replacement.

* How to [change the background in your Twilio Video calls with the Twilio Video Processors library](https://www.twilio.com/blog/change-background-video-calls-twilio-video-processors-library)
* [Video Processors documentation](https://www.twilio.com/docs/video/video-processors)
* The [Video Processor source code](https://github.com/twilio/twilio-video-processors.js)

### Noise cancellation

Much as it is hard to control your visual background, it can also be difficult to control background noise. With [Twilio Video's Noise Cancellation](https://www.twilio.com/blog/introducing-noise-cancellation-for-twilio-video) we can improve the quality of every video call by removing unnecessary background noise.

* [Noise Cancellation with Twilio Video](https://www.twilio.com/blog/introducing-noise-cancellation-for-twilio-video)

## Running this project

To run this project you will need Node.js version 18 and a Twilio account ([sign up for a free Twilio accout here](https://www.twilio.com/try-twilio)). Once you have those, in hand, follow these steps:

1. Clone the repository from GitHub

    ```
    git clone https://github.com/philnash/advanced-twilio-video.git
    cd advanced-twilio-video
    ```

1. Install the repositories

    ```
    npm install
    ```

1. Copy the `.env.example` file to `.env`

    ```
    cp .env.example .env
    ```

1. Fill in your Twilio Account Sid in `.env`. Create an API Key and Secret in the Twilio console and fill those both into `.env` too.

1. Run the project with

    ```
    npm start
    ```

Note: some of the features in this example application require Group rooms. You may need to switch the default room type to Group rooms.