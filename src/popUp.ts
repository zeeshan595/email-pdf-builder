class Button {
  text: string = "";
  callback: () => void = () => {};
}

const showPopup = (text: string, buttons: Button[]) => {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modalBody");
  const modalbuttons = document.getElementById("modalbuttons");

  if (modal) modal.style.display = "block";
  if (modalText) modalText.innerHTML = text;
  if (modalbuttons) {
    modalbuttons.innerHTML = "";
    buttons.forEach(button => {
      const el = document.createElement("button");
      el.innerHTML = button.text;
      el.onclick = () => {
        if (button.callback) button.callback();
      };
      modalbuttons.appendChild(el);
    });
  }
};

const hidePopup = () => {
  const modal = document.getElementById("modal");
  const modalbuttons = document.getElementById("modalbuttons");

  if (modal) modal.style.display = "none";
  if (modalbuttons) modalbuttons.innerHTML = "";
};

module.exports = {
  show: showPopup,
  hide: hidePopup,
  asyncShow: async (
    text: string,
    buttons: Button[],
    autoHide: boolean = false
  ) => {
    return new Promise((resolve, reject) => {
      const buttonsWithCallback: Button[] = [];
      for (let i = 0; i < buttons.length; i++) {
        buttonsWithCallback.push({
          text: buttons[i].text,
          callback: () => {
            if (buttons[i].callback) buttons[i].callback();
            if (autoHide) hidePopup();
            resolve(i);
          }
        });
      }
      showPopup(text, buttonsWithCallback);
    });
  }
};
