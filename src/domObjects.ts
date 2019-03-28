module.exports = {
  logArea: document.getElementById("log-area"),
  browseButton: document.getElementById("browse-button"),
  convertToHTMLButton: document.getElementById("convert-to-html-button"),
  screenShotsButton: document.getElementById("screen-shots-button"),
  toSinglePdfButton: document.getElementById("to-single-pdf-button"),
  settingsButton: document.getElementById("settings-button"),
  progressBar: document.getElementById("progress-bar"),
  createLabel: (text: string): HTMLLabelElement => {
    const label = document.createElement("label");
    label.innerHTML = text;
    return label;
  },
  createButton: (text: string, callback: () => void): HTMLButtonElement => {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    if (callback) btn.onclick = callback;
    return btn;
  },
  createTextField: (
    placeholder: string,
    defaultValue: string,
    type: string = "text",
    callback: (text: string) => void
  ): HTMLInputElement => {
    const field = document.createElement("input");
    field.type = type;
    field.placeholder = placeholder;
    field.value = defaultValue;
    field.onchange = () => {
      if (callback) callback(field.value);
    };
    return field;
  },
  createToggle: (
    defaultValue: boolean,
    callback: (isChecked: boolean) => void
  ): HTMLDivElement => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = false;

    const container = document.createElement("div");
    container.classList.add("checkboxContainer");
    container.appendChild(checkbox);

    const onClickToggle = () => {
      if (!checkbox.checked) {
        container.classList.add("checkboxContainerChecked");
        checkbox.checked = true;
      } else {
        container.classList.remove("checkboxContainerChecked");
        checkbox.checked = false;
      }

      if (callback) callback(checkbox.checked);
    };

    container.onclick = onClickToggle;
    checkbox.onclick = onClickToggle;

    if (defaultValue) {
      onClickToggle();
    }

    return container;
  },
  createForumContainer: (els: HTMLElement[]): HTMLDivElement => {
    const div = document.createElement("div");
    div.classList.add("forumElement");
    els.forEach(el => {
      div.appendChild(el);
    });
    return div;
  }
};
