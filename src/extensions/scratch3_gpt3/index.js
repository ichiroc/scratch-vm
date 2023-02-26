const { Configuration, OpenAIApi } = require('openai');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');


/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png+xml;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEeWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDIzLTAyLTI1PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjBjMzA2NTQ4LWM1MGQtNGIzZC05NGI3LTg3NWY3M2MyMGI3MDwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz7opovlh7rjgZfjgpLov73liqAgLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkljaGlybyBOQUtBVEFOSTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PosmrvEAAAGoSURBVFiF7ddBa9RAGIDhdybTyS7sggW36sW221JWxIKiF6EHDx704KX/Ui/+CqXCHsRVF4TQSynYSi26kk0yMx5qSgVFmA+1lHkvCWEgDzNhkqi79x4EznH6fwP+VAJKS0BpCSgtAaUloLQElHaxgSGcfKkppU6Pvzpvx8VkJDitNfN5RdM0dDo5TdPgnMfaBaqqAiDPc7TWhBBOwX8d2OLKsmR5+TrXri4xeTtlbbhCr9+jKHZZXx8SQmA6/UBZlmgdt1hRwBY3Gm2wvf2Eotjl4PATjx4/xGSGG6MNlq4MsAuWyeR91MyJgEop5vOKzVs3mbx5x5evM7a27mOMQWvNzqsxa8NVvPccHX1mcfESzrkoaNS8e+/pdru8eLnD6nCFO7c3ATj4eMizp88Zj1/T6eQ47zDGRD9/ACrmp6m9YV3X9Ps9BoPL7O3tA1DXNVmWkWlNgOiZa4te4hAC1lpms28cHxdYawHIsgyAxrmfxsYio7cZpRTe+5PZ+oFqOwuS4EC4Uf/uxmevS3Bw0V91/6IElJaA0hJQWgJKS0BpCSjt3AO/AwfwkolZL3UVAAAAAElFTkSuQmCC'

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/png+xml;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEeWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDIzLTAyLTI1PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjBjMzA2NTQ4LWM1MGQtNGIzZC05NGI3LTg3NWY3M2MyMGI3MDwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz7opovlh7rjgZfjgpLov73liqAgLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkljaGlybyBOQUtBVEFOSTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PosmrvEAAAGoSURBVFiF7ddBa9RAGIDhdybTyS7sggW36sW221JWxIKiF6EHDx704KX/Ui/+CqXCHsRVF4TQSynYSi26kk0yMx5qSgVFmA+1lHkvCWEgDzNhkqi79x4EznH6fwP+VAJKS0BpCSgtAaUloLQElHaxgSGcfKkppU6Pvzpvx8VkJDitNfN5RdM0dDo5TdPgnMfaBaqqAiDPc7TWhBBOwX8d2OLKsmR5+TrXri4xeTtlbbhCr9+jKHZZXx8SQmA6/UBZlmgdt1hRwBY3Gm2wvf2Eotjl4PATjx4/xGSGG6MNlq4MsAuWyeR91MyJgEop5vOKzVs3mbx5x5evM7a27mOMQWvNzqsxa8NVvPccHX1mcfESzrkoaNS8e+/pdru8eLnD6nCFO7c3ATj4eMizp88Zj1/T6eQ47zDGRD9/ACrmp6m9YV3X9Ps9BoPL7O3tA1DXNVmWkWlNgOiZa4te4hAC1lpms28cHxdYawHIsgyAxrmfxsYio7cZpRTe+5PZ+oFqOwuS4EC4Uf/uxmevS3Bw0V91/6IElJaA0hJQWgJKS0BpCSjt3AO/AwfwkolZL3UVAAAAAElFTkSuQmCC'


/**
 * Class for the new blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3Gpt3Blocks {
    apiKey = ''

    constructor (runtime) {
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
        this.runtime = runtime;

    // this._onTargetCreated = this._onTargetCreated.bind(this);
    // this.runtime.on('targetWasCreated', this._onTargetCreated);
    }


    /**
* @returns {object} metadata for this extension and its blocks.
*/
    getInfo () {
        return {
            id: 'gpt3',
            name: 'GPT3',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'ask',
                    blockType: BlockType.REPORTER,
                    text: 'GPT3に答えを聞く [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '君の名前は？'
                        }
                    }
                },
                {
                    opcode: 'setApiKey',
                    blockType: BlockType.COMMAND,
                    text: 'APIキーをセット'
                }
            ],
            menus: {
            }
        };
    }
    ask (args){
      if (this.apiKey === 'APIキー' || this.apiKey === ''){
            return 'openai.com のサイトからAPIキーを取得してセットください';
        }
        const question = Cast.toString(args.TEXT);

        const configuration = new Configuration({
            apiKey: this.apiKey
        });
        const openai = new OpenAIApi(configuration);

        const completionPromise = openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${question} \n\n\n と聞いている子供に対して、頼り甲斐のあるお兄さんが教えてあげる口調で答えてください。`,
            temperature: 0,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).then(response => {
          return(response.data.choices[0].text.replaceAll("\n", ''));
        }).catch(error => {
          console.log(error);
          return(`失敗しちゃったみたい。理由はこれだよ「${error}」`);
        });
      return completionPromise;
    }

    setApiKey () {
        this.apiKey = window.prompt('OpenAI のAPIキーを入力してください');
    }
}

module.exports = Scratch3Gpt3Blocks;
