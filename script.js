// ==UserScript==
// @name         Geschenkscript
// @namespace    http://tampermonkey.net/
// @version      2024-03-05
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @match REPLACEWITHYOURWEBSITEURL
// @match *://*.amazon.de/*
// @match *://*.amazon.com/*
// @grant       GM_cookie
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_listValues
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(async function () {
  "use strict";

  // Your code here...
  if (document.URL === "REPLACEWITHYOURWEBSITEURL") {
    GM_setValue("geschenkeCookies", document.cookie);
    return;
  }
  const wishListButtonStack = document.getElementById("wishlistButtonStack");
  if (!wishListButtonStack) {
    console.log("no wishlist-box found!");
    return;
  }

  const style = document.createElement("style");
  document.head.appendChild(style);
  style.innerHTML = `
            .myForm {
        z-index: 3000;
        top: 12.5%;
        left: 12.5%;
        position: fixed;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1em;
        border-radius: 12px;
        padding: 1em;
        background: #1b1b1b;
        color: white;
        align-items: center;
        width: 75%;
        height: 75%;
        box-shadow: rgba(33, 33, 33, 1) 0px 0px 1px 2px, rgba(33, 33, 33, 0.5) 0px 0px 0px 2556px
      }

      .myForm .myInput {
        background: #fff;
        border: 1px solid #9c9c9c;
        border-radius: 4px;
      }
      .myForm .mySelect{
        border-radius: 4px;
      }

      .myForm .myButton {
        background: lightgrey;
        padding: 0.7em;
        width: 100%;
        border: 0;
        border-radius: 4px;
      }

      .myForm .myButton:hover {
        background: gold;
      }

      .myLabel {
        padding: 0.5em 0.5em 0.5em 0;
      }

      .myInput {
        padding: 0.7em;
        margin-bottom: 0.5rem;
      }

      .mySelect:focus,textarea:focus,.myInput:focus {
          outline: 3px solid gold;

      }

      .mySelect {
        height: 50%;
      }
      .myTextarea {
        resize: none;
      }

      @media (min-width: 400px) {
        .myForm {
          grid-gap: 16px;
        }
        .myLabel {
          text-align: right;
          grid-column: 1 / 2;
        }
        .myInput, .mySelect, .myTextarea {
          grid-column: 2 / 5;
        }
        .myButton{
          height: 50%;
        }
        .myButton:nth-child(odd){
          grid-column: 1 / 3;
        }
        .myButton:nth-child(even){
          grid-column: 3 / 5;
        }
      }
      .addButton {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        background: pink;
        border-radius: 4px;
      }
      `;

  const openDialogButton = document.createElement("button");
  openDialogButton.innerHTML = "Auf der Geschenkseite erneut anmelden!";
  openDialogButton.onclick = () => {
    window.open("REPLACEWITHYOURWEBSITEURL", "_blank");
    window.location.reload();
  };
  openDialogButton.classList.add("addButton");
  openDialogButton.type = "button";
  wishListButtonStack.append(openDialogButton);
  if (!GM_listValues().includes("geschenkeCookies")) {
    openDialogButton.innerHTML = "Auf der Geschenkseite anmelden!";
    return;
  }

  let token = GM_getValue("geschenkeCookies").split("=")[1];

  const dialog = document.createElement("div");
  dialog.innerHTML = `
            <form class="myForm">
      <label class="myLabel">Name des Geschenks</label>
      <input class="myInput" maxlength="60" id="giftName" />

      <label class="myLabel">Beschreibung des Geschenks</label>
      <textarea
        class="myTextarea"
        maxlength="255"
        rows="5"
        cols="20"
        id="giftDescription"
      ></textarea>

      <label class="myLabel">Preis des Geschenks</label>
      <input class="myInput" type="number" id="giftPrice" />

      <label class="myLabel">Liste zum hinzufügen auswählen</label>
      <select class="mySelect" id="giftLists"></select>
      <label class="myLabel">Wunschstärke</label>
      <select class="mySelect" id="giftStrength">
        <option value="OKAY">Ganz okay</option>
        <option value="GOOD">Okay</option>
        <option value="GREAT" selected>Gut</option>
        <option value="AMAZING">Super</option>
        <option value="AWESOME">Mega</option>
      </select>
      <button type="button" class="myButton" id="sendGift">
        Als Geschenk hinzufügen
      </button>
      <button type="button" class="myButton" id="closeDialog">schließen</button>
    </form>
            `;
  dialog.style.visibility = "hidden";
  document.body.appendChild(dialog);

  const select = document.getElementById("giftLists");
  openDialogButton.innerHTML = "Als Geschenk zur Geschenkeliste hinzufügen";
  openDialogButton.onclick = () => {
    dialog.style.visibility = "visible";
  };
  await GM_xmlhttpRequest({
    method: "GET",
    url: "REPLACEWITHYOURWEBSITEURL/api/giftgroups/",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    onload: await function (response) {
      if (response.status !== 200) {
        openDialogButton.innerHTML = "Auf der Geschenkseite erneut anmelden!";
        openDialogButton.onclick = () => {
          window.open("REPLACEWITHYOURWEBSITEURL", "_blank");
          window.location.reload();
        };
        return;
      }
      const example_array = JSON.parse(response.response);
      for (const index in example_array) {
        select.options[select.options.length] = new Option(
          example_array[index].name,
          example_array[index].id
        );
      }
    },
  });
  const image = document.querySelector("#landingImage").src;
  const imageBlob = await fetch(image)
    .then((response) => response.blob())
    .then((blob) => blob);
  const title = document
    .querySelector("#productTitle")
    .textContent.trim()
    .substring(0, 60);
  let price = Number(
    document.querySelector(".a-offscreen").textContent.split("€")[1]
  );
  if (!price || isNaN(price)) price = 0;
  const link = document.URL;

  const titleInput = document.getElementById("giftName");
  titleInput.value = title;

  const descriptionInput = document.getElementById("giftDescription");

  const priceInput = document.getElementById("giftPrice");
  priceInput.value = price;

  const strengthInput = document.getElementById("giftStrength");

  const button = document.getElementById("sendGift");
  button.innerHTML = "Als Geschenk hinzufügen";
  button.style.margin = "10px";
  button.onclick = async () => {
    if (isNaN(Number(priceInput.value))) return;
    const formData = new FormData();
    formData.append("name", titleInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("price", Number(priceInput.value));
    formData.append("giftStrength", strengthInput.value);
    formData.append("link", link);
    formData.append("picture", imageBlob);
    await fetch(`REPLACEWITHYOURWEBSITEURL/api/gifts/${select.value}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    dialog.style.display = "none";
  };
  const innerCloseButton = document.getElementById("closeDialog");
  innerCloseButton.onclick = () => {
    dialog.style.visibility = "hidden";
  };
})();
