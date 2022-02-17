body = document.body;
swch = document.getElementsByClassName('switch');
upload_view = document.getElementsByClassName('upload-view')[0];
file_sys_view = document.getElementsByClassName('file-sys-view')[0];
svg = document.getElementsByTagName('svg');

document.addEventListener("dragover", (e) => {
    e.preventDefault();
});

document.addEventListener('dragstart', () => {
    body.setAttribute('style', 'background-color: rgba(248, 247, 216, 0.7);')
});

document.addEventListener('drop', (e) => {
    console.log('gootis');
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
});

document.addEventListener('dragend', () => {
    body.removeAttribute('style')
});

let swfn = () => {
    if(upload_view.hasAttribute('style')){
        upload_view.removeAttribute('style');
        file_sys_view.setAttribute('style', 'display: none;');
        svg[0].removeAttribute('style');
        //document.head.innerHTML = document.head.innerHTML.replace('<link rel="stylesheet" href="/fsys.css">', '<!--<link rel="stylesheet" href="/fsys.css">-->')
    }
    else {
        svg[0].setAttribute('style', 'display: none;');
        file_sys_view.removeAttribute('style');
        upload_view.setAttribute('style', 'display: none;');
        //document.head.innerHTML = document.head.innerHTML.replace('<!--<link rel="stylesheet" href="/fsys.css">-->', '<link rel="stylesheet" href="/fsys.css">')
    }
}

swch[0].addEventListener('click', swfn);
swch[1].addEventListener('click', swfn);

