const dialog = document.querySelector(".photo-dialog");
const dialogImage = document.querySelector(".dialog-image");
const caption = document.querySelector(".caption");
const comments = document.querySelector(".comments");
const photoGrid = document.querySelector(".photo-grid");
const feedStatus = document.querySelector(".feed-status");
const feedStatusMessage = document.querySelector(".feed-status-message");
const pageFilename = decodeURIComponent(window.location.pathname.split("/").pop());
const pageName = pageFilename.replace(/\.html$/i, "");
const profileUrl = new URL(`../profiles/${encodeURIComponent(pageName)}.json`, window.location.href);
const photosUrl = new URL(`../photos/${encodeURIComponent(pageName)}.json`, window.location.href);
const profileHeader = document.querySelector(".profile");
const profileStatus = document.querySelector(".profile-status");
const profileStatusMessage = document.querySelector(".profile-status-message");
let photos = [];
let currentPhoto = 0;

function setProfileStatus(state, message) {
    profileStatus.dataset.state = state;
    profileStatus.setAttribute("role", state === "error" ? "alert" : "status");
    profileStatus.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
    profileStatusMessage.textContent = message;
    profileStatus.replaceChildren(profileStatusMessage);
    profileStatus.hidden = false;
    profileHeader.setAttribute("aria-busy", state === "loading" ? "true" : "false");

    if (state === "error") {
        const retryButton = document.createElement("button");
        retryButton.className = "feed-retry";
        retryButton.type = "button";
        retryButton.dataset.profileRetry = "";
        retryButton.textContent = "Tentar novamente";
        profileStatus.append(retryButton);
    }
}

function isValidProfile(profile) {
    return Boolean(
        profile &&
        typeof profile.username === "string" &&
        typeof profile.profilePicture?.src === "string" &&
        typeof profile.profilePicture?.alt === "string" &&
        typeof profile.profile?.name === "string" &&
        typeof profile.profile?.bio === "string" &&
        typeof profile.profile?.place === "string" &&
        Number.isFinite(profile.profile?.stats?.publishedPhotos) &&
        Number.isFinite(profile.profile?.stats?.followers) &&
        Number.isFinite(profile.profile?.stats?.following)
    );
}

async function loadProfile() {
    setProfileStatus("loading", "Carregando perfil...");

    try {
        const response = await fetch(profileUrl);
        if (!response.ok) throw new Error("A resposta do arquivo de perfil não foi válida.");

        const profile = await response.json();
        if (!isValidProfile(profile)) throw new Error("O arquivo de perfil tem um formato inválido.");

        const profileImage = document.querySelector(".avatar img");
        const profilePictureUrl = new URL(profile.profilePicture.src, profileUrl).href;
        const numberFormat = new Intl.NumberFormat("pt-BR");

        document.querySelector("#profile-name").textContent = profile.profile.name;
        document.querySelector("#username").value = profile.username;
        document.querySelector("#dialog-account-name").textContent = profile.username;
        document.querySelector("#published-photos").textContent = numberFormat.format(profile.profile.stats.publishedPhotos);
        document.querySelector("#followers").textContent = numberFormat.format(profile.profile.stats.followers);
        document.querySelector("#following").textContent = numberFormat.format(profile.profile.stats.following);
        document.querySelector("#profile-bio-text").textContent = profile.profile.bio;
        document.querySelector("#profile-place").textContent = profile.profile.place;
        document.querySelector(".photo-grid").setAttribute("aria-label", `Fotos publicadas por ${profile.profile.name}`);
        profileImage.src = profilePictureUrl;
        profileImage.alt = profile.profilePicture.alt;
        document.querySelector(".mini-avatar").src = profilePictureUrl;
        document.title = `${profile.profile.name} (@${profile.username}) · Instantgram`;
        document.querySelector('meta[name="description"]').content = `Perfil público de ${profile.profile.name} no Instantgram.`;
        profileStatus.hidden = true;
        profileHeader.setAttribute("aria-busy", "false");
    } catch (error) {
        setProfileStatus("error", "Não foi possível carregar os dados deste perfil. Verifique a conexão e tente novamente.");
        console.error("Falha ao carregar os dados do perfil:", error);
    }
}

function setFeedStatus(state, message) {
    feedStatus.dataset.state = state;
    feedStatus.setAttribute("role", state === "error" ? "alert" : "status");
    feedStatus.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
    feedStatusMessage.textContent = message;
    feedStatus.replaceChildren(feedStatusMessage);
    feedStatus.hidden = false;

    if (state === "error") {
        const retryButton = document.createElement("button");
        retryButton.className = "feed-retry";
        retryButton.type = "button";
        retryButton.dataset.retry = "";
        retryButton.textContent = "Tentar novamente";
        feedStatus.append(retryButton);
    }
}

function createPhotoButton(photo, index) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const image = document.createElement("img");

    button.className = "photo-button";
    button.type = "button";
    button.dataset.photo = index;
    button.setAttribute("aria-label", `Abrir foto: ${photo.alt}`);
    image.src = photo.src;
    image.alt = photo.alt;
    image.loading = "lazy";
    button.append(image);
    item.append(button);
    return item;
}

function renderPhotos() {
    const fragment = document.createDocumentFragment();
    photos.forEach((photo, index) => fragment.append(createPhotoButton(photo, index)));
    photoGrid.replaceChildren(fragment);
    photoGrid.hidden = photos.length === 0;
    feedStatus.hidden = photos.length > 0;
}

async function loadPhotos() {
    setFeedStatus("loading", "Carregando fotos...");
    photoGrid.hidden = true;

    try {
        const response = await fetch(photosUrl);
        if (!response.ok) throw new Error("A resposta do arquivo de fotos não foi válida.");

        const result = await response.json();
        if (!Array.isArray(result) || result.some((photo) => (
            !photo || typeof photo.src !== "string" || typeof photo.alt !== "string" ||
            typeof photo.caption !== "string" || typeof photo.date !== "string" ||
            typeof photo.dateISO !== "string" || !Array.isArray(photo.comments)
        ))) {
            throw new Error("O arquivo de fotos tem um formato inválido.");
        }

        photos = result;
        if (photos.length === 0) {
            setFeedStatus("empty", "Este perfil ainda não tem fotos publicadas.");
            return;
        }

        renderPhotos();
    } catch (error) {
        photos = [];
        photoGrid.replaceChildren();
        setFeedStatus("error", "Não foi possível carregar as fotos do feed deste perfil. Tente novamente em instantes.");
        console.error("Falha ao carregar o feed de fotos:", error);
    }
}

function renderPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];

    dialogImage.src = photo.src;
    dialogImage.alt = photo.alt;
    caption.replaceChildren();

    const author = document.createElement("strong");
    author.textContent = document.getElementById("username").value;
    caption.append(author, document.createTextNode(photo.caption));

    const date = document.createElement("time");
    date.dateTime = photo.dateISO;
    date.textContent = photo.date;
    caption.append(date);

    comments.replaceChildren();
    for (const comment of photo.comments) {
        const item = document.createElement("li");
        item.className = "comment";
        const name = document.createElement("strong");
        name.textContent = comment.name;
        const text = document.createElement("p");
        text.append(name, document.createTextNode(` ${comment.text}`));
        item.append(text);
        comments.append(item);
    }
}

photoGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-photo]");
    if (!button) return;

    renderPhoto(Number(button.dataset.photo));
    dialog.showModal();
});

feedStatus.addEventListener("click", (event) => {
    if (event.target.closest("[data-retry]")) loadPhotos();
});

profileStatus.addEventListener("click", (event) => {
    if (event.target.closest("[data-profile-retry]")) loadProfile();
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.querySelector(".dialog-previous").addEventListener("click", () => renderPhoto(currentPhoto - 1));
document.querySelector(".dialog-next").addEventListener("click", () => renderPhoto(currentPhoto + 1));

dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});

loadProfile();
loadPhotos();