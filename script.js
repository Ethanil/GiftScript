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
// @match *://*.idealo.de/*
// @match *://*.brettspiel-angebote.de/*
// @grant       GM_cookie
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(async function () {
  "use strict";
  let giftSideURL = "REPLACEWITHYOURWEBSITEURL";
  if (
    !giftSideURL.endsWith("/") &&
    giftSideURL != "REPLACEWITHYOURWEBSITEURL"
  ) {
    giftSideURL += "/";
  }
  if (giftSideURL == "REPLACEWITHYOURWEBSITEURL") {
    var h1 = document.createElement("H1");
    h1.innerHTML =
      "URL nicht korrekt eingegeben, bitte giftSideURL mit der richtigen URL ersetzen!";
    document.body.prepend(h1);
    return;
  }
  const withTimeout = (fn, timeout = 5000) =>
    new Promise((resolve, reject) => {
      const endTime = Date.now() + timeout;

      const attempt = () => {
        Promise.resolve(fn())
          .then((result) => {
            if (result != null && result != undefined) {
              resolve(result);
            } else if (Date.now() < endTime) {
              attempt(); // Retry if result is nullish and time remains
            } else {
              reject(new Error("Timeout"));
            }
          })
          .catch((err) => {
            if (Date.now() < endTime) {
              attempt(); // Retry on error if time remains
            } else {
              reject(err);
            }
          });
      };

      attempt();
    });
  const siteSettings = {
    "www.amazon.de": {
      buttonPosition: () =>
        withTimeout(() => document.getElementById("wishlistButtonStack")),
      downloadImage: true,
      giftImage: () =>
        withTimeout(() => document.querySelector("#landingImage")?.src ?? document.querySelector("#main-image")?.src),
      giftPrice: () =>
        withTimeout(() => {
          let wholePrice = document
            .querySelector(".a-price-whole")
            .textContent.trim();
          let fractionPrice = document
            .querySelector(".a-price-fraction")
            .textContent.trim();
          if (wholePrice && wholePrice != "" && fractionPrice && fractionPrice != "") return wholePrice+fractionPrice;
          let text = document.querySelector(".a-offscreen").textContent.trim();
          if (text != "") {
            return text.split("€")[1];
          }
          return "0.0";
        }),
      giftName: () =>
        withTimeout(() => document.querySelector("#productTitle") ?? document.querySelector("#title")),
    },
    "www.amazon.com": {
buttonPosition: () =>
        withTimeout(() => document.getElementById("wishlistButtonStack")),
      downloadImage: true,
      giftImage: () =>
        withTimeout(() => document.querySelector("#landingImage")?.src ?? document.querySelector("#main-image")?.src),
      giftPrice: () =>
        withTimeout(() => {
          let wholePrice = document
            .querySelector(".a-price-whole")
            .textContent.trim();
          let fractionPrice = document
            .querySelector(".a-price-fraction")
            .textContent.trim();
          if (wholePrice && wholePrice != "" && fractionPrice && fractionPrice != "") return wholePrice+fractionPrice;
          let text = document.querySelector(".a-offscreen").textContent.trim();
          if (text != "") {
            return text.split("€")[1];
          }
          return "0.0";
        }),
      giftName: () =>
        withTimeout(() => document.querySelector("#productTitle") ?? document.querySelector("#title")),
    },
    "www.idealo.de": {
      buttonPosition: () =>
        withTimeout(
          () => document.getElementsByClassName("oopStage-wrapper columns")[0]
        ),
      downloadImage: false,
      giftImage: () => withTimeout(()=> document.querySelector("#slide-0").querySelector("img").src),
      giftPrice: () =>
        withTimeout(() => {
          let priceVariant = document.getElementsByClassName(
            "oopStage-variantThumbnailsFromPrice"
          );
          if (priceVariant.length > 0)
            return priceVariant[0].textContent.split("€")[0];
          return document
            .getElementsByClassName(
              "oopStage-conditionButton-wrapper-text-price"
            )[0]
            .children[1].textContent.split("€")[0];
        }),
      giftName: () =>
        withTimeout(
          () => document.getElementById("oopStage-title").children[0]
        ),
    },
    "www.brettspiel-angebote.de": {
      buttonPosition: () =>
        withTimeout(
          () =>
            document.querySelector(".cover-image.main:not(.mb-3)").parentElement
              .parentElement
        ),
      downloadImage: true,
      giftImage: () =>
        withTimeout(
          () =>
            document.querySelector(".cover-image.main:not(.mb-3)").children[0]
              .src
        ),
      giftPrice: () =>
        withTimeout(
          () =>
            document
              .getElementById("current-bestprices")
              .querySelector(".price-single.px-2")
              .textContent.split("€")[0]
        ),
      giftName: () =>
        withTimeout(() => document.querySelector(".breadcrumb-item.active")),
    },
  };
  if (document.URL === giftSideURL) {
    GM_setValue("geschenkeCookies", document.cookie);
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
    window.open(giftSideURL, "_blank");
    window.location.reload();
  };
  openDialogButton.classList.add("addButton");
  openDialogButton.type = "button";

  const siteHostname = window.location.hostname;
  siteSettings[siteHostname]
    .buttonPosition()
    .then((buttonPosition) => {
      buttonPosition.append(openDialogButton);
    })
    .catch((error) => console.error("Error finding button position:", error));

  if (!GM_listValues().includes("geschenkeCookies")) {
    openDialogButton.innerHTML = "Auf der Geschenkseite anmelden!";
    return;
  }

  let token = "";
  let splitCookie = GM_getValue("geschenkeCookies").split(";");
  for (let i = 0; i < splitCookie.length; i++) {
    if (
      splitCookie[i].startsWith(" auth:token") ||
      splitCookie[i].startsWith("auth:token")
    ) {
      token = splitCookie[i].split("=")[1];
    }
  }

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
    url: giftSideURL + "api/giftgroups/",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    onload: await function (response) {
      if (response.status !== 200) {
        GM_deleteValue("geschenkeCookies");
        openDialogButton.innerHTML = "Auf der Geschenkseite erneut anmelden!";
        openDialogButton.onclick = () => {
          window.open(giftSideURL, "_blank");
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
  let imageBlob;
  if (siteSettings[siteHostname].downloadImage) {
    siteSettings[siteHostname]
      .giftImage()
      .then(async (image) => {
        imageBlob = await fetch(image)
          .then((response) => response.blob())
          .then((blob) => blob);
      })
      .catch((error) => console.error("Error finding image:", error));
  } else{
    siteSettings[siteHostname].giftImage().then((url) => {imageBlob = url});
  }
  const titleInput = document.getElementById("giftName");
  siteSettings[siteHostname].giftName().then((title) => {
    title = title.textContent.trim().substring(0, 60);
    titleInput.value = title;
  });
  const priceInput = document.getElementById("giftPrice");
  siteSettings[siteHostname].giftPrice().then((price) => {
    if (!price) price = "0";
    price = Number(price.trim().replace(",", "."));
    if (!price || isNaN(price)) price = 0;
    priceInput.value = price;
  });

  const link = document.URL;

  const descriptionInput = document.getElementById("giftDescription");
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
    await fetch(giftSideURL + `api/gifts/${select.value}`, {
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
