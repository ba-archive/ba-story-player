import eventBus from "@/eventBus";
import { PlayAudio } from "@/types/events";
import { Sound } from "@pixi/sound";
import { usePlayerStore } from "@/stores";


/**
 * 初始化声音层, 订阅player的剧情信息.
 */
export function soundInit() {
    let bgm: Sound | undefined = undefined;
    let sfx: Sound | undefined = undefined;
    let voice: Sound | undefined = undefined;

    /**
     * 声音层的全局设置, 包括BGM音量, 效果音量和语音音量
     */
    let soundSettings = new class SoundSettings {
        BGMvolume = 0.3;
        SFXvolume = 1;
        Voicevolume = 1;
    }

    /**
     * @description 播放声音
     * @param playAudioInfo
     */
    function playAudio(playAudioInfo: PlayAudio) {
        if (playAudioInfo.bgm) {    // 替换BGM
            if (bgm) {
                bgm.stop();
            } // 如果有正在播放的BGM则停止当前播放, 替换为下一个BGM
            bgm = Sound.from({
                volume: soundSettings.BGMvolume,
                url: playAudioInfo.bgm.url,
                preload: true,
                loaded: function (err, sound) {
                    sound?.play({   // 第一次是非loop播放, 播放到LoopStartTime为止
                        loop: false,
                        start: 0,
                        end: playAudioInfo.bgm?.bgmArgs.LoopStartTime,
                        complete: function (sound) {    // 第一次播放结束后进入loop
                            sound?.play({
                                loop: true,
                                start: playAudioInfo.bgm?.bgmArgs.LoopStartTime,
                                end: playAudioInfo.bgm?.bgmArgs.LoopEndTime
                            })
                        }
                    })  // 这样写真的好吗...
                }
            })
        }
        if (playAudioInfo.soundUrl) {
            if (sfx) {
                sfx.stop();
            }
            sfx = Sound.from({
                volume: soundSettings.SFXvolume,
                url: playAudioInfo.soundUrl,
                preload: true,
                loaded: (err, sound) => {
                    sound?.play({
                        complete: () => {
                            console.log("Finish Playing Sound!")
                        }
                    })
                }
            })
        }
        if (playAudioInfo.voiceJPUrl) {
            if (voice) {
                voice.stop();
            }
            voice = Sound.from({
                volume: soundSettings.Voicevolume,
                url: playAudioInfo.voiceJPUrl,
                preload: true,
                loaded: (err, sound) => {
                    sound?.play({
                        complete: () => {
                            eventBus.emit('playVoiceJPDone', playAudioInfo.voiceJPUrl || "")
                        }
                    })
                }
            })
        }
    }

    // 当想要播放VoiceJP的时候, 可以直接
    // eventBus.emit('playAudio', {voiceJPUrl: url})
    // 这样就可以了x

    eventBus.on('playAudio', (playAudioInfo: PlayAudio) => {
        console.log(`Get playAudioInfo: ${playAudioInfo.soundUrl || playAudioInfo.voiceJPUrl || playAudioInfo.bgm?.url}`)
        playAudio(playAudioInfo);
    })

    eventBus.on('playEmotionAudio', (emotype: string) => {
        let url = usePlayerStore().emotionSoundUrl(emotype)
        console.log(`Get emoAudio URL: ${url}`)
        playAudio({
            soundUrl: url
        })
    })

    eventBus.on('playOtherSounds', sound => {
        console.log("Play Select Sound!")
        playAudio({ soundUrl: usePlayerStore().otherSoundUrl(sound) })
    })
}
