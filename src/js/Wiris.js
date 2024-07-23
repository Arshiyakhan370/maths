import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver/theme';
import 'tinymce/icons/default/icons';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
const MathTypeEditor = () => {
    const [saveMode, setSaveMode] = useState('xml');
    const [editMode, setEditMode] = useState('text');
    const [lang, setLang] = useState('en');
    const [editorParams, setEditorParams] = useState({});

    useEffect(() => {
        createEditorInstance();
    }, [lang, editorParams]);

    const updateFunction = () => {
        updatePreview();
        updateHTMLCode();
    };

    const updatePreview = () => {
        const data = getEditorData();
        const previewDiv = document.getElementById('preview_div');
        previewDiv.innerHTML = data;
        if (window.com?.wiris?.js?.JsPluginViewer) {
            window.com.wiris.js.JsPluginViewer.parseDocument();
        }
        imgSetTitle(previewDiv);
    };

    const updateHTMLCode = () => {
        const data = getEditorData();
        const dataCode = (data.replace(/</g, '&lt;')).trim();
        const htmlCodeDiv = document.getElementById('htmlcode_div');

        let jsExampleScript = '';
        if (saveMode === 'xml') {
            jsExampleScript += `var js = document.createElement("script");\n`;
            jsExampleScript += `js.type = "text/javascript";\n`;
            jsExampleScript += `js.src = "WIRISplugins.js?viewer=image";\n`;
            jsExampleScript += `document.head.appendChild(js);\n\n`;
        }

        htmlCodeDiv.innerHTML = `<pre class='wrs_inline'><code id='code_block' style='color:#e0e0e0'>${jsExampleScript + dataCode}</code></pre>`;
        highlightCode(data);
    };

    const changeMode = (mode) => {
        setSaveMode(mode);
        if (mode === 'base64') {
            setEditMode('image');
        }
        updateFunction();
    };

    const setParameters = () => {
        if (checkValidJson()) {
            setParametersSpecificPlugin(editorParams);
        }
    };

    const checkValidJson = () => {
        const error = isValidJson(JSON.stringify(editorParams));
        const notification = document.getElementById('notification_set_parameters');
        if (!error) {
            notification.className = 'wrs_notification_valid';
            notification.innerHTML = 'Done';
            return true;
        } else {
            notification.className = 'wrs_notification_invalid';
            notification.innerHTML = 'This is not a valid JSON';
            return false;
        }
    };

    const isValidJson = (json) => {
        try {
            JSON.parse(json);
            return "";
        } catch (e) {
            return e.message;
        }
    };

    const highlightCode = (data) => {
        const htmlCodeDiv = document.getElementById('htmlcode_div');
        let htmlContent = htmlCodeDiv.innerHTML;
        const openHighlight = "<pre class='language-xml wrs_inline' style='word-wrap:break-word;background-color:white'><code>";
        const closeHighlight = "</code></pre>";

        if (saveMode === 'xml') {
            let indexsEnd = getMatchIndices(htmlContent, '&lt;/math&gt;');
            indexsEnd.reverse().forEach(index => {
                htmlContent = htmlContent.slice(0, index + 13) + closeHighlight + htmlContent.slice(index + 13);
            });

            let indexsStart = getMatchIndices(htmlContent, '&lt;math');
            indexsStart.reverse().forEach(index => {
                htmlContent = htmlContent.slice(0, index) + openHighlight + htmlContent.slice(index);
            });
        } else if (saveMode === 'image' || saveMode === 'base64') {
            let indexsStart = getMatchIndices(htmlContent, '&lt;img');
            if (indexsStart.length === 0) {
                indexsStart = getMatchIndices(htmlContent, '&lt;IMG');
            }
            indexsStart.reverse().forEach(index => {
                let endIndex = htmlContent.indexOf('&gt;', index);
                if (endIndex !== -1) {
                    htmlContent = htmlContent.slice(0, endIndex + 4) + closeHighlight + htmlContent.slice(endIndex + 4);
                }
                htmlContent = htmlContent.slice(0, index) + openHighlight + htmlContent.slice(index);
            });
        }

        htmlCodeDiv.innerHTML = htmlContent;
    };

    const getMatchIndices = (str, find) => {
        const indices = [];
        let data;
        const exp = new RegExp(find, 'g');
        while ((data = exp.exec(str))) {
            indices.push(data.index);
        }
        return indices;
    };

    const imgSetTitle = (previewDiv) => {
        const imgs = previewDiv.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            imgs[i].title = imgs[i].alt;
        }
    };

    const createEditorInstance = () => {
        tinymce.init({
            selector: '.example',
            height: 300,
            auto_focus: true,
            directionality: lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr',
            menubar: false,
            plugins: 'tiny_mce_wiris',
            toolbar: 'bold italic underline | cut copy paste | undo redo | fontselect fontsizeselect | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry',
            setup: (editor) => {
                editor.on('init', () => {
                    editor.getDoc().body.style.fontSize = '16px';
                    editor.getDoc().body.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
                });
            },
            init_instance_callback: () => updateFunction(),
            language: lang
        });
    };

    const getEditorData = () => {
        return tinymce.get('example')?.getContent() || '';
    };

    const setParametersSpecificPlugin = (params) => {
        tinymce.activeEditor?.settings.wiriseditorparameters = params;
        tinymce.activeEditor?.destroy();
        createEditorInstance();
    };

    return (
        <div>
            <div id="preview_div"></div>
            <div id="htmlcode_div"></div>
            <textarea id="editor_parameters"></textarea>
            <button id="set_parameters" onClick={setParameters}>Set Parameters</button>
            <button onClick={() => changeMode('xml')}>Set XML Mode</button>
            <button onClick={() => changeMode('image')}>Set Image Mode</button>
            <button onClick={() => changeMode('base64')}>Set Base64 Mode</button>
            <button onClick={() => setLang('en')}>Set English</button>
            <button onClick={() => setLang('ar')}>Set Arabic</button>
            <button onClick={() => setLang('he')}>Set Hebrew</button>
            <div id="notification_set_parameters"></div>
            <div>
                <label>
                    <input type="checkbox" id="advanced_options_checkbox" onChange={() => document.getElementById('advanced_options').style.display = document.getElementById('advanced_options_checkbox').checked ? 'inherit' : 'none'} />
                    Show Advanced Options
                </label>
                <div id="advanced_options" style={{ display: 'none' }}>
                    Advanced options content here.
                </div>
            </div>
            <Editor
                apiKey='your-api-key'
                init={{
                    selector: '.example',
                    height: 300,
                    menubar: false,
                    plugins: 'tiny_mce_wiris',
                    toolbar: 'bold italic underline | cut copy paste | undo redo | fontselect fontsizeselect | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry',
                    setup: (editor) => {
                        editor.on('init', () => {
                            editor.getDoc().body.style.fontSize = '16px';
                            editor.getDoc().body.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
                        });
                    },
                    directionality: lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr',
                    language: lang
                }}
            />
        </div>
    );
};

export default MathTypeEditor;
