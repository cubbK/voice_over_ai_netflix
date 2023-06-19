# Voice Over AI Netflix (Swedish)

I want to watch Swedish dubbed movies but there aren't that many that are not for children. But since Netflix usually has Swedish subtitles I decided to use Text-To-Speech generation to read them out loud.

it reminds me of when in childhood a lot of movies I watched were dubbed by a single person with a bad mic in a basement.



https://github.com/cubbK/voice_over_ai_netflix/assets/3717949/253bb994-b97c-4a48-a4a2-2fe66b53402d



## How it works

[Coqui](https://github.com/coqui-ai/TTS) is used as a language model and I forked [neon-tts-plugin-coqui](https://github.com/NeonGeckoCom/neon-tts-plugin-coqui) that already had a server working.

Then the chrome extension intercepts the subtitles and fetches the generated audio line by line. It is so fast that no buffering is required.

## How to run locally

1.

```bash
git clone https://github.com/cubbK/voice_over_ai_netflix.git
cd voice_over_ai_netflix/language_model_server
docker build . -t voice-over-ai-netflix
docker run -p 9666:9666 -p 7860:7860 voice-over-ai-netflix
```

2. Go to chrome://extensions/ and "load unpacked" the `extension_chrome` folder

3. Go to a movie on Netflix, choose Swedish subtitles and reload the page

## Is there an easier way to run this?

Not yet.
