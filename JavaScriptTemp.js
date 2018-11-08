function spiteToSection(content, preMark, sufMark) {
    var list = [];
    var mArr = preMark;
    var sb = "";
    var isSkip = false;
    for (var i = 0; i < content.length; i++) {
        for (var j = 0; j < mArr.length; j++) {
            if (content[i + j] !== mArr[j])
                break;
            if (j === mArr.length - 1) {
                if (mArr === preMark) {
                    mArr = sufMark;
                    if (sb.length > 0) {
                        list.push(sb);
                        sb = "";
                    }
                    sb += preMark;
                } else {
                    mArr = preMark;
                    sb += sufMark;
                    list.push(sb);
                    sb = "";
                }
                i += j;
                isSkip = true;
                break;
            }
        }
        if (isSkip)
            isSkip = false;
        else {
            sb += content[i];
        }
    }
    if (sb.length > 0)
        list.push(sb);
    return list;
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

function reanderTemplateContent(content) {
    var htmlContent = "";
    var list = spiteToSection(content, "<!--#>", "<#-->");
    var code = '';
    for (var i = 0; i < list.length; i++) {
        if (list[i].startsWith("<!--#>")) {
            code += list[i].replace("<!--#>", "").replace("<#-->", "");
        } else {
            code += reanderHtmlStr(list[i]);
        }
    }
    code = code.replace(new RegExp('//.*', "gim"), "").replace(new RegExp('\n', "gim"), " ");
    code = removeSection(code, "<script", "</script>");
    code = removeSection(code, "<style", "</style>");
    code = removeSection(code, "<link", "</link>");
    eval(code);
    return htmlContent;
}

function reanderHtmlStr(content) {
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
//渲染模板
function renderTamplate(tamplateId, obj) {
    try {
        if (!window.htmlBodyTemp)
            window.htmlBodyTemp = "<div>" + $(document.body).html()
            .replace(new RegExp('\\{#', "gim"), "<!--#>")
            .replace(new RegExp('#\\}', "gim"), "<#-->")
            .replace(new RegExp('(<!--@>)|(<@-->)', "gim"), "") + "</div>";
        if (obj)
            $.extend(this, obj);
        var strHtml = window.htmlBodyTemp;
        if (!tamplateId)
            tamplateId = document.body;
        else
            strHtml = $(strHtml).find(tamplateId = "#" + tamplateId).html();
        strHtml = reanderTemplateContent(strHtml);
        $(tamplateId).html(strHtml);
    } catch (err) {
        console.error("Render template error.");
    }
}