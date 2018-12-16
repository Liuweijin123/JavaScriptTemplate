function spiteToSection(content, preMark, sufMark) {
    var sections = [],
        positions = [0];
    var slide = "";
    var cnt = 0;
    for (var i = 0; i < content.length; i++) {
        for (var j = 0; j < preMark.length || j < sufMark.length; j++) {
            slide += content[i + j];
            if (content[i + j] !== preMark[j] && content[i + j] !== sufMark[j]) {
                break;
            }
            if (slide === preMark) {
                if (!cnt && i !== 0) {
                    positions.push(i);
                }
                cnt++;
                i += j;
            }
            if (slide === sufMark) {
                cnt--;
                i += j;
                if (!cnt && i + 1 !== content.length) {
                    positions.push(i + 1);
                }
            }
        }
        slide = "";
    }
    positions.push(content.length);
    for (var i = 0; i < positions.length - 1; i++) {
        sections.push(content.substring(positions[i], positions[i + 1]));
    }
    return sections;
}

function removeSection(content, preMark, sufMark) {
    var list = spiteToSection(content, preMark, sufMark);
    var nArr = [];
    for (var i = 0; i < list.length; i++) {
        if (!list[i].startsWith(preMark)) {
            nArr.push(list[i]);
        }
    }
    return nArr.join(' ');
}

function initTamplate(content) {
    var list = spiteToSection(content, "<!--@>", "<@-->");
    for (var i = 0; i < list.length; i++) {
        var str = list[i];
        if (!list[i].startsWith("<!--@>")) {
            str = removeSection(str, "<script", "</script>");
            str = removeSection(str, "<style", "</style>");
            str = removeSection(str, "<link", "</link>");
        }
        list[i] = str;
    }
    var rs = list.join(' ').replace(new RegExp('\\{#', "gim"), "<!--#>")
        .replace(new RegExp('#\\}', "gim"), "<#-->")
        .replace(new RegExp('(<!--@>)|(<@-->)', "gim"), "");
    return rs;
}

function renderElement(content) {
    var code = "";
    var list = spiteToSection(content, "${", "}");
    for (var i = 0; i < list.length; i++) {
        if (list[i].startsWith("${")) {
            code += "htmlContent += tryGetVal(function(){return " + list[i].replace("${", "").replace("}", "") + "});";
        } else {
            code += 'htmlContent +="' + list[i].replace(new RegExp('\\"', "gim"), '\\"') + '";';
        }
    }
    return code;
}

function tryGetVal(fc) {
    try {
        return fc();
    } catch (err) {
        console.error(err.message);
        return "";
    }
}
//渲染内容
function reanderContent(content, obj) {
    try {
        with(obj, this) {
            var htmlContent = "";
            var list = spiteToSection(initTamplate(content), "<!--#>", "<#-->");
            var code = '';
            for (var i = 0; i < list.length; i++) {
                if (list[i].startsWith("<!--#>")) {
                    code += list[i].replace("<!--#>", "").replace("<#-->", "");
                } else {
                    code += renderElement(list[i]);
                }
            }
            code = code.replace(new RegExp('//.*', "gim"), "").replace(new RegExp('\n', "gim"), " ");
            eval(code);

            return htmlContent;
        }
    } catch (err) {
        console.error("Render template error.");
        console.log(err.message);
    }
}
//渲染模板
function renderTamplate(tamplateId, obj) {
    var strHtml = window.htmlBodyTemp;
    if (!tamplateId)
        tamplateId = document.body;
    else
        strHtml = $(strHtml).find(tamplateId = "#" + tamplateId).html();
    strHtml = reanderContent(strHtml, obj);
    $(tamplateId).html(strHtml);
}
$(function () {
    if (!window.htmlBodyTemp)
        window.htmlBodyTemp = "<div>" + $(document.body).html() + "</div>";
})
