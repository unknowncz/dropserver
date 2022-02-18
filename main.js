body = document.body;
swch = document.getElementsByClassName('switch');
upload_view = document.getElementsByClassName('upload-view')[0];
file_sys_view = document.getElementsByClassName('file-sys-view')[0];
svg = document.getElementsByTagName('svg');
folders = document.getElementsByClassName('folder')

const emptydiv = document.createElement('div')
emptydiv.textContent = '-Empty-'
emptydiv.className = 'file'

const fulldiv = document.createElement('div')
const a = document.createElement('a');

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

document.addEventListener("dragover", (e) => {
    e.preventDefault();
});

document.addEventListener('dragstart', () => {
    if (!upload_view.hasAttribute('style')) {
        body.setAttribute('style', 'background-color: rgba(248, 247, 216, 0.7);')
    }
});

document.addEventListener('drop', (e) => {
    if (!upload_view.hasAttribute('style')) {
        e.preventDefault();
        if(e.dataTransfer.items){
            for(i=0;i<e.dataTransfer.files.length;i++){
                if (e.dataTransfer.items[i].kind === 'file') {
                    let req = new XMLHttpRequest();
                    let formData = new FormData();

                    formData.append("content", e.dataTransfer.items[i].getAsFile());                                
                    req.open("POST", '/upload');
                    req.send(formData);
                }
            }
        }
    }
});

document.addEventListener('dragend', () => {
    body.removeAttribute('style')
});

let swfn = () => {
    if (upload_view.hasAttribute('style')){
        upload_view.removeAttribute('style');
        file_sys_view.setAttribute('style', 'display: none;');
        svg[0].removeAttribute('style');
        //document.head.innerHTML = document.head.innerHTML.replace('<link rel="stylesheet" href="/fsys.css">', '<!--<link rel="stylesheet" href="/fsys.css">-->')
    } else {
        svg[0].setAttribute('style', 'display: none;');
        file_sys_view.removeAttribute('style');
        upload_view.setAttribute('style', 'display: none;');
        //document.head.innerHTML = document.head.innerHTML.replace('<!--<link rel="stylesheet" href="/fsys.css">-->', '<link rel="stylesheet" href="/fsys.css">')
    }
}

swch[0].addEventListener('click', swfn);
swch[1].addEventListener('click', swfn);

for (i=0;i<folders.length;i++) {
    folders[i].addEventListener('click', (e) => {
        x = new XMLHttpRequest();
        x.open("GET", "/getfiles" + e.target.innerText.trim(), false);
        x.send();
        if (x.status == 200) {
            emptydiv.hidden = true
            fulldiv.hidden = true
            fulldiv.innerHTML = ''
            if (x.response.length > 2) {
                console.log(x.response.split('\r').join('').split('<>'))
                for(j=0;j<x.response.split('\r').join('').split('<>').length;j++){
                    f = x.response.split('\r').join('').split('<>')[j]
                    fulldiv.innerHTML += '<button class=\'file\' onclick=\'reqfile("' + f + '")\'><span class=\'colorfull\' style=\'background-color: rgb(91, 123, 121);\'>&nbsp;&nbsp;</span>&nbsp;' + f + '</button><br>'
                }
                insertAfter(fulldiv, e.target.parentElement)
                fulldiv.hidden = false
            } else {
                insertAfter(emptydiv, e.target.parentElement)
                emptydiv.hidden = false
            }
        };
    })
}

function reqfile(f) {
    xhr = new XMLHttpRequest();
    xhr.open('POST', "/getfile" + fulldiv.previousSibling.textContent.trim() + '/' + f, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        var blob = e.currentTarget.response;
        a.href = window.URL.createObjectURL(blob);
        a.download = f;
        a.dispatchEvent(new MouseEvent('click'))
    }
    xhr.send();
}
