/* globals zip, document, URL, MouseEvent, alert */

(() => {
  const model = (() => {
    return {
      getEntries(file, options) {
        return new zip.ZipReader(new zip.BlobReader(file)).getEntries(options);
      },
      async getURL(entry, options) {
        return URL.createObjectURL(
          await entry.getData(new zip.BlobWriter(), options)
        );
      },
    };
  })();

  (() => {
    const appContainer = document.getElementById("container");
    const fileInput = document.getElementById("file-input");
    //const encodingInput = document.getElementById("encoding-input");
    const fileInputButton = document.getElementById("file-input-button");
   // const passwordInput = document.getElementById("password-input");
    let fileList = document.getElementById("file-list");
    let entries;
    let selectedFile;

    async () =>
      fileList
        .querySelectorAll("a[download]")
        .forEach((anchor) => (anchor.download = ""));
    fileInput.onchange = selectFile;
    appContainer.onclick = downloadFile;
    fileInputButton.onclick = () =>
      fileInput.dispatchEvent(new MouseEvent("click"));

    async function downloadFile(event) {
      const target = event.target;
      if (
        target.dataset.entryIndex !== undefined &&
        !target.download &&
        !target.getAttribute("href")
      ) {
        event.preventDefault();
        try {
          await download(
            entries[Number(target.dataset.entryIndex)],
            target.parentElement,
            target
          );
        } catch (error) {
          alert(error);
        }
      }
    }

    async function selectFile() {
      try {
        fileInputButton.disabled = true;
       // encodingInput.disabled = true;
        selectedFile = fileInput.files[0];
        await loadFiles();
      } catch (error) {
        alert(error);
      } finally {
        fileInputButton.disabled = false;
        fileInput.value = "";
      }
    }

    async function loadFiles(filenameEncoding) {
      entries = await model.getEntries(selectedFile, { filenameEncoding });
      if (entries && entries.length) {
        fileList.classList.remove("empty");
        const filenamesUTF8 = Boolean(
          !entries.find((entry) => !entry.filenameUTF8)
        );
       // const encrypted = Boolean(entries.find((entry) => entry.encrypted));
        // encodingInput.value = filenamesUTF8
        //   ? "utf-8"
        //   : filenameEncoding || "cp437";
        // encodingInput.disabled = filenamesUTF8;
        // passwordInput.value = "";
        // passwordInput.disabled = !encrypted;
        refreshList();
      }
    }

    function refreshList() {
      const newFileList = fileList.cloneNode();
      entries.forEach((entry, entryIndex) => {
        const li = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.dataset.entryIndex = entryIndex;
        anchor.textContent = anchor.title = entry.filename;
        anchor.title = `${
          entry.filename
        }\n  Last modification date: ${entry.lastModDate.toLocaleString()}`;
        if (!entry.directory) {
          anchor.href = "";
          anchor.title += `\n  Uncompressed size: ${entry.uncompressedSize.toLocaleString()} bytes`;
        }
        li.appendChild(anchor);
        newFileList.appendChild(li);
      });
      fileList.replaceWith(newFileList);
      fileList = newFileList;
    }

    async function download(entry, li, a) {
      const unzipProgress = document.createElement("progress");
      li.appendChild(unzipProgress);
     
      const clickEvent = new MouseEvent("click");
      unzipProgress.remove();
      unzipProgress.value = 0;
      unzipProgress.max = 0;
      a.href = blobURL;
      a.download = entry.filename;
      a.dispatchEvent(clickEvent);
    }
  })();
})();
