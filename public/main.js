let photoTaken = false;
      let stylesList = [];
      const styleSelect = document.getElementById('style-select');
      const customPromptInput = document.getElementById('custom-prompt');
      async function initializeStyles() {
        const res = await fetch('/api/styles');
        const styles = await res.json();
        stylesList = styles;
        const selectedModel = modelSelect.value;
        const previouslySelected = styleSelect.value;
        styleSelect.innerHTML = '';
        if (selectedModel === 'fofr') {
          fofrStyles.forEach(style => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style;
            styleSelect.appendChild(option);
          });
          const defaultStyle = fofrStyles.includes(previouslySelected) ? previouslySelected : fofrStyles[Math.floor(Math.random() * fofrStyles.length)];
          styleSelect.value = defaultStyle;
          customPromptInput.value = `A portrait image in the style of ${styleSelect.value}`;
          customPromptInput.disabled = true;
          customPromptInput.style.opacity = '0.6';
        } else {
          styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.name;
            option.textContent = style.name;
            styleSelect.appendChild(option);
          });
          const validStyle = styles.find(s => s.name === previouslySelected);
          const randomStyle = styles[Math.floor(Math.random() * styles.length)];
          const defaultStyle = validStyle ? validStyle.name : randomStyle.name;
          styleSelect.value = defaultStyle;
          const word = selectedModel === 'photomaker' ? 'img' : 'image';
          const defaultPrompt = `A portrait ${word} in the style of ${styleSelect.value}`;
          customPromptInput.value = defaultPrompt;
          customPromptInput.disabled = false;
          customPromptInput.style.opacity = '1';
        }
      }
      initializeStyles();
      const fofrStyles = ['3D', 'Emoji', 'Video game', 'Pixels', 'Clay', 'Toy'];
      const modelSelect = document.getElementById('model-select');
      modelSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        const selectedStyleName = styleSelect.value;
        if (selectedModel === 'fofr') {
          styleSelect.innerHTML = '';
          const selectedModel = modelSelect.value;
          styleSelect.innerHTML = '';
          if (selectedModel === 'fofr') {
            fofrStyles.forEach(style => {
              const option = document.createElement('option');
              option.value = style;
              option.textContent = style;
              styleSelect.appendChild(option);
            });
            const randomFofrStyle = fofrStyles[Math.floor(Math.random() * fofrStyles.length)];
            styleSelect.value = randomFofrStyle;
            customPromptInput.value = `A portrait img in the style of ${randomFofrStyle}`;
            customPromptInput.disabled = true;
            customPromptInput.style.opacity = '0.6';
          } else {
            styles.forEach(style => {
              const option = document.createElement('option');
              option.value = style.name;
              option.textContent = style.name;
              styleSelect.appendChild(option);
            });
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            styleSelect.value = randomStyle.name;
            customPromptInput.value = randomStyle.prompt;
            customPromptInput.disabled = false;
            customPromptInput.style.opacity = '1';
          }
          const randomFofrStyle = fofrStyles[Math.floor(Math.random() * fofrStyles.length)];
          styleSelect.value = randomFofrStyle;
          customPromptInput.value = `A portrait image in the style of ${randomFofrStyle}`;
          customPromptInput.disabled = true;
          customPromptInput.style.opacity = '0.6';
        } else {
          styleSelect.innerHTML = '';
          stylesList.forEach(style => {
            const option = document.createElement('option');
            option.value = style.name;
            option.textContent = style.name;
            styleSelect.appendChild(option);
          });
          const fallback = stylesList[0].name;
          const exists = stylesList.find(s => s.name === selectedStyleName);
          styleSelect.value = exists ? selectedStyleName : fallback;
          const word = selectedModel === 'photomaker' ? 'img' : 'image';
          customPromptInput.value = `A portrait ${word} in the style of ${styleSelect.value}`;
          customPromptInput.disabled = false;
          customPromptInput.style.opacity = '1';
        }
      });
      styleSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        const word = selectedModel === 'photomaker' ? 'img' : 'image';
        if (selectedModel === 'fofr') {
          customPromptInput.value = `A portrait image in the style of ${styleSelect.value}`;
        } else {
          customPromptInput.value = `A portrait ${word} in the style of ${styleSelect.value}`;
        }
      });
      const form = document.getElementById('upload-form');
      const resultImg = document.getElementById('result-img');
      const styleDisplay = document.getElementById('style-display');
      const errorMessage = document.getElementById('error-message');
      const loadingSpinner = document.getElementById('loading-spinner');
      const fileInput = document.getElementById('photo');
      const filenameDisplay = document.getElementById('filename-display');
      fileInput.addEventListener('change', () => {
        const imageUrlInput = document.getElementById('image-url');
        if (imageUrlInput) imageUrlInput.value = '';
        setTimeout(() => {
          if (fileInput.files && fileInput.files.length > 0) {
            filenameDisplay.textContent = fileInput.files[0].name;
          } else {
            filenameDisplay.textContent = 'No file chosen';
          }
        }, 0);
      });
      const imageUrlInput = document.getElementById('image-url');
      imageUrlInput.addEventListener('input', () => {
        if (imageUrlInput.value.trim()) {
          const filename = imageUrlInput.value.trim().split('/').pop().split('?')[0];
          filenameDisplay.textContent = filename || 'URL image selected';
        } else {
          filenameDisplay.textContent = 'No file chosen';
        }
      });
      const dropArea = document.getElementById('drop-area');
      function updateDragDropVisibility() {
        if (window.innerWidth < 768) {
          dropArea.style.display = 'none';
        } else {
          dropArea.style.display = 'block';
        }
      }
      updateDragDropVisibility();
      window.addEventListener('resize', () => {
        if (!countdownOverlay.classList.contains('hidden')) {
          positionCountdownOverlay();
        }
      });
      window.addEventListener('resize', updateDragDropVisibility);
      ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.remove('dragover');
        });
      });
      dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
          fileInput.files = files;
          filenameDisplay.textContent = files[0].name;
        }
      });
      const openCameraBtn = document.getElementById('open-camera');
      const toggleCameraBtn = document.getElementById('toggle-camera');
      const cameraModal = document.getElementById('camera-modal');
      const cameraStreamElem = document.getElementById('camera-stream');
      const takePhotoBtn = document.getElementById('take-photo');
      const snapshotCanvas = document.getElementById('snapshot');
      const closeCameraBtn = document.getElementById('close-camera');
      let cameraStream;
      let useFrontCamera = true;
      let countdownInterval;
      let countdownNumber;
      const ctx = snapshotCanvas.getContext('2d');
      async function startCamera() {
        const facingMode = useFrontCamera ? 'user' : 'environment';
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode
            }
          });
          cameraStreamElem.srcObject = cameraStream;
          if (useFrontCamera) {
            cameraStreamElem.classList.add('mirror-preview');
          } else {
            cameraStreamElem.classList.remove('mirror-preview');
          }
        } catch (err) {
          console.log('Could not access camera: ' + err.message);
          cameraModal.classList.add('hidden');
        }
      }
      function updateToggleCameraVisibility() {
        const isMobile = window.innerWidth < 768;
        const cameraIsOpen = !cameraModal.classList.contains('hidden');
        if (cameraIsOpen && !photoTaken) {
          toggleCameraBtn.style.display = isMobile ? 'inline-block' : 'none';
        } else {
          toggleCameraBtn.style.display = 'none';
        }
      }
      updateToggleCameraVisibility();
      window.addEventListener('resize', updateToggleCameraVisibility);
      function stopCamera() {
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          cameraStream = null;
        }
      }
      openCameraBtn.addEventListener('click', async () => {
        photoTaken = false;
        cameraModal.classList.remove('hidden');
        snapshotCanvas.classList.add('hidden');
        cameraStreamElem.style.display = 'block';
        takePhotoBtn.style.display = 'inline-block';
        if (window.innerWidth < 768) {
          toggleCameraBtn.style.display = 'inline-block';
        } else {
          toggleCameraBtn.style.display = 'none';
        }
        countdownOverlay.style.display = 'none';
        if (retakeBtn) retakeBtn.remove();
        await startCamera();
        positionCountdownOverlay();
        updateToggleCameraVisibility();
      });
      toggleCameraBtn.addEventListener('click', async () => {
        useFrontCamera = !useFrontCamera;
        stopCamera();
        await startCamera();
        positionCountdownOverlay();
      });
      closeCameraBtn.addEventListener('click', () => {
        stopCamera();
        cameraModal.classList.add('hidden');
        clearCountdown();
        snapshotCanvas.classList.add('hidden');
        cameraStreamElem.style.display = 'block';
        takePhotoBtn.style.display = 'inline-block';
        countdownOverlay.style.display = 'none';
        if (retakeBtn) retakeBtn.remove();
        fileInput.value = '';
        filenameDisplay.textContent = 'No file chosen';
        updateToggleCameraVisibility();
        photoTaken = false;
        openCameraBtn.disabled = false;
      });
      const countdownOverlay = document.createElement('div');
      countdownOverlay.style.position = 'absolute';
      countdownOverlay.style.top = 0;
      countdownOverlay.style.left = 0;
      countdownOverlay.style.right = 0;
      countdownOverlay.style.bottom = '74px';
      countdownOverlay.style.display = 'flex';
      countdownOverlay.style.alignItems = 'center';
      countdownOverlay.style.justifyContent = 'center';
      countdownOverlay.style.fontSize = '6rem';
      countdownOverlay.style.color = 'white';
      countdownOverlay.style.textShadow = '0 0 10px black';
      countdownOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
      countdownOverlay.style.zIndex = 10;
      countdownOverlay.style.borderRadius = '12px';
      countdownOverlay.style.userSelect = 'none';
      countdownOverlay.style.pointerEvents = 'none';
      countdownOverlay.style.display = 'none';
      cameraModal.style.position = 'relative';
      cameraModal.appendChild(countdownOverlay);
      function clearCountdown() {
        clearInterval(countdownInterval);
        countdownOverlay.style.display = 'none';
      }
      let retakeBtn;
      function createRetakeButton() {
        retakeBtn = document.createElement('button');
        retakeBtn.textContent = 'Retake';
        retakeBtn.type = 'button';
        retakeBtn.style.marginBottom = '8px';
        retakeBtn.style.background = '#555';
        retakeBtn.style.color = 'white';
        retakeBtn.style.border = 'none';
        retakeBtn.style.padding = '10px 20px';
        retakeBtn.style.borderRadius = '10px';
        retakeBtn.style.cursor = 'pointer';
        const cameraButtons = document.getElementById('camera-buttons');
        cameraButtons.insertBefore(retakeBtn, closeCameraBtn);
        retakeBtn.addEventListener('click', async () => {
          retakeBtn.disabled = true;
          snapshotCanvas.classList.add('hidden');
          retakeBtn.remove();
          photoTaken = false;
          takePhotoBtn.style.display = 'inline-block';
          if (window.innerWidth < 768) {
            toggleCameraBtn.style.display = 'inline-block';
          } else {
            toggleCameraBtn.style.display = 'none';
          }
          countdownOverlay.style.display = 'none';
          cameraStreamElem.style.display = 'block';
          fileInput.value = '';
          filenameDisplay.textContent = 'No file chosen';
          try {
            stopCamera();
            await startCamera();
            positionCountdownOverlay();
          } catch (err) {
            console.error('Failed to restart camera:', err);
            alert('Could not access the camera. Please try again.');
            retakeBtn.disabled = false;
          }
          setTimeout(updateToggleCameraVisibility, 10);
        });
      }
      function positionCountdownOverlay() {
        const containerRect = cameraModal.getBoundingClientRect();
        const streamRect = cameraStreamElem.getBoundingClientRect();
        const top = streamRect.top - containerRect.top;
        const left = streamRect.left - containerRect.left;
        countdownOverlay.style.position = 'absolute';
        countdownOverlay.style.top = top + 'px';
        countdownOverlay.style.left = left + 'px';
        countdownOverlay.style.width = streamRect.width + 'px';
        countdownOverlay.style.height = streamRect.height + 'px';
      }
      takePhotoBtn.addEventListener('click', () => {
        const imageUrlInput = document.getElementById('image-url');
        if (imageUrlInput) imageUrlInput.value = '';
        countdownNumber = 3;
        countdownOverlay.textContent = countdownNumber;
        positionCountdownOverlay();
        countdownOverlay.style.display = 'flex';
        openCameraBtn.disabled = true;
        takePhotoBtn.style.display = 'none';
        toggleCameraBtn.style.display = 'none';
        cameraStreamElem.style.display = 'block';
        countdownInterval = setInterval(() => {
          countdownNumber--;
          if (countdownNumber === 0) {
            clearCountdown();
            openCameraBtn.disabled = false;
            const MAX_WIDTH = 512;
            const originalWidth = cameraStreamElem.videoWidth;
            const originalHeight = cameraStreamElem.videoHeight;
            const scale = MAX_WIDTH / originalWidth;
            snapshotCanvas.width = MAX_WIDTH;
            snapshotCanvas.height = originalHeight * scale;
            if (useFrontCamera) {
              ctx.save();
              ctx.translate(snapshotCanvas.width, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(cameraStreamElem, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
              ctx.restore();
            } else {
              ctx.drawImage(cameraStreamElem, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
            }
            photoTaken = true;
            snapshotCanvas.toBlob(blob => {
              if (!blob) {
                console.error('No blob returned from canvas.');
                return;
              }
              const file = new File([blob], 'captured-photo.png', {
                type: 'image/png'
              });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInput.files = dataTransfer.files;
              fileInput.dispatchEvent(new Event('change'));
              const imageUrlField = document.getElementById('image-url');
              if (imageUrlField) {
                imageUrlField.value = '';
              }
            }, 'image/png');
            setTimeout(() => {
              cameraStreamElem.style.display = 'none';
              toggleCameraBtn.style.display = 'none';
              snapshotCanvas.classList.remove('hidden');
              createRetakeButton();
              setTimeout(updateToggleCameraVisibility, 50);
            }, 100);
          } else {
            countdownOverlay.textContent = countdownNumber;
          }
        }, 1000);
      });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.style.display = 'none';
        const imageUrlField = document.getElementById('image-url');
        const imageUrlValue = imageUrlField?.value.trim();
        if ((!fileInput.files || fileInput.files.length === 0) && !imageUrlValue) {
          errorMessage.textContent = 'Please upload a file or enter an image URL before generating.';
          errorMessage.style.display = 'block';
          return;
        }
        console.log('Submitting file:', fileInput.files[0]);
        errorMessage.style.display = 'none';
        styleDisplay.textContent = '';
        resultImg.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        progressBar.style.display = 'block';
        progressText.style.display = 'block';
        progressBar.value = 0;
        progressText.textContent = '0%';
        const estimatedTime = 10000;
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, Math.floor((elapsed / estimatedTime) * 100));
          progressBar.value = progress;
          progressText.textContent = `${progress}%`;
          if (progress >= 100) clearInterval(progressInterval);
        }, 200);
        const formData = new FormData();
        const imageUrlInput = document.getElementById('image-url').value.trim();
        if (imageUrlInput) {
          formData.append('imageUrl', imageUrlInput);
        } else {
          formData.append('photo', fileInput.files[0]);
        }
        formData.append('selectedStyle', styleSelect.value);
        formData.append('customPrompt', customPromptInput.value);
        formData.append('model', document.getElementById('model-select').value);
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          loadingSpinner.style.display = 'none';
          clearInterval(progressInterval);
          progressBar.style.display = 'none';
          progressText.style.display = 'none';
          console.log('Response data:', data);
          if (typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
            console.log('Setting image src to:', data.imageUrl);
            styleDisplay.textContent = `Style applied: ${data.message.replace('Image processed in ', '')}`;
            resultImg.src = data.imageUrl;
            resultImg.style.display = 'block';
            if (typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
              resultImg.src = data.imageUrl;
              resultImg.style.display = 'block';
              downloadBtn.style.display = 'inline-block';
              downloadBtn.onclick = async () => {
                try {
                  const response = await fetch(resultImg.src, {
                    mode: 'cors'
                  });
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = `styled-image-${Date.now()}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(blobUrl);
                } catch (err) {
                  console.error('Failed to download image:', err);
                }
              };
            } else {
              downloadBtn.style.display = 'none';
            }
            const selectedStyleName = document.getElementById('style-select').value;
            const selectedStyle = stylesList.find(s => s.name === selectedStyleName);
            const defaultPromptForStyle = selectedStyle?.prompt?.trim() ?? '';
            const userPrompt = customPromptInput.value.trim();
            const model = document.getElementById('model-select').value;
            const normalize = str => str.trim().toLowerCase().replace(/\bimg\b/g, 'image').replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '');
            let isCustomPrompt = false;
            if (model === 'fofr') {
              isCustomPrompt = false;
            } else {
              isCustomPrompt = normalize(userPrompt) !== normalize(defaultPromptForStyle);
            }
            styleDisplay.textContent = isCustomPrompt ? `Custom prompt applied` : `Style applied: ${selectedStyleName}`;
          } else {
            console.error('Invalid imageUrl:', data.imageUrl);
            errorMessage.textContent = 'Received invalid image URL.';
            errorMessage.style.display = 'block';
          }
        } catch (err) {
          loadingSpinner.style.display = 'none';
          clearInterval(progressInterval);
          progressBar.style.display = 'none';
          progressText.style.display = 'none';
          errorMessage.textContent = 'An error occurred. Please try again.';
          errorMessage.style.display = 'block';
          console.error(err);
        }
      });
      const randomizeBtn = document.getElementById('randomize-style');
      randomizeBtn.addEventListener('click', () => {
        const selectedModel = modelSelect.value;
        if (selectedModel === 'fofr') {
          const randomStyle = fofrStyles[Math.floor(Math.random() * fofrStyles.length)];
          styleSelect.value = randomStyle;
          customPromptInput.value = `A portrait image in the style of ${randomStyle}`;
        } else {
          if (!stylesList || stylesList.length === 0) return;
          const randomStyle = stylesList[Math.floor(Math.random() * stylesList.length)];
          styleSelect.value = randomStyle.name;
          let prompt = randomStyle.prompt;
          if (selectedModel === 'photomaker') {
            prompt = prompt.replace(/\bimage\b/g, 'img');
          }
          customPromptInput.value = prompt;
          styleDisplay.textContent = '';
        }
      });
      const promptTextarea = document.getElementById('custom-prompt');
      promptTextarea.addEventListener('input', () => {
        promptTextarea.style.height = 'auto';
        promptTextarea.style.height = promptTextarea.scrollHeight + 'px';
      });
      window.addEventListener('load', () => {
        promptTextarea.style.height = 'auto';
        promptTextarea.style.height = promptTextarea.scrollHeight + 'px';
      });
      document.addEventListener('paste', async (event) => {
        const clipboardItems = event.clipboardData?.items;
        if (!clipboardItems) return;
        for (let i = 0; i < clipboardItems.length; i++) {
          const item = clipboardItems[i];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInput.files = dataTransfer.files;
              document.getElementById('image-url').value = '';
              filenameDisplay.textContent = file.name || 'Pasted image';
              fileInput.dispatchEvent(new Event('change'));
              console.log('📋 Image pasted from clipboard:', file);
              return;
            }
          }
          if (item.kind === 'string') {
            item.getAsString((text) => {
              if (text.startsWith('data:image/')) {
                fetch(text).then(res => res.blob()).then(blob => {
                  const file = new File([blob], 'pasted-image.png', {
                    type: blob.type
                  });
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  fileInput.files = dataTransfer.files;
                  document.getElementById('image-url').value = '';
                  filenameDisplay.textContent = file.name;
                  fileInput.dispatchEvent(new Event('change'));
                  console.log('📋 Base64 image pasted and converted:', file);
                });
              }
            });
          }
        }
      });