const panel = (e) => {
    document.querySelector(".modal-box").setAttribute("style", "display:none;")
}

const openUp = () => {
    document.querySelector(".modal-box").setAttribute("style", "display:flex;");
}

document.getElementById("back").addEventListener("click", panel);
document.getElementById("adder").addEventListener("click", openUp);


