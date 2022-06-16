// const timeBtn = document.querySelector("#timeBtn");
const iframe = document.querySelector("#hidden");
const body = document.querySelector("body");
// function handleSubmit()
// {
//     hidden.display = flex;
// }

// timeBtn.addiframeListener("submit",handleSubmit);
// var height = document.getElementById("#hidden").contentWindow.document.body.scrollHeight;

// document.getElement

function setIFrameHeight(event){

    if(iframe.contentDocument){
    
        iframe.height = iframe.contentDocument.body.offsetHeight + 40;
    
    } else {
    
    iframe.height = iframe.contentWindow.document.body.scrollHeight;
    
    }
    
}

iframe.contentDocument.addEventListener("change",setIFrameHeight);
body.addEventListener("change",)