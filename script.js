const video = document.getElementById('camera');
const startBtn = document.getElementById('startBtn');
const countdownEl = document.getElementById('countdown');
const thumbnails = document.querySelectorAll('.thumb img');
const starMessage = document.getElementById('message');
const editBtn = document.getElementById('editBtn');
const retakeBtn = document.getElementById('retakeBtn');
const afterButtons = document.getElementById('afterButtons');
const editSection = document.getElementById('editSection');
const mainSection = document.getElementById('mainSection');
const retakeFromEditBtn = document.getElementById('retakeFromEditBtn');

// 1. Mở camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (error) {
    alert("Không thể truy cập camera 😢");
    console.error(error);
  }
}

// 2. Countdown
function showCountdown(seconds) {
  return new Promise((resolve) => {
    let count = seconds;
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;
    const interval = setInterval(() => {
      count--;
      countdownEl.textContent = count > 0 ? count : '📸';
      if (count <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          countdownEl.style.display = 'none';
          resolve();
        }, 500);
      }
    }, 1000);
  });
}

// 3. Chụp ảnh
function takePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

// 4. Chụp liên tiếp 4 ảnh
async function takePhotosSequence() {
  thumbnails.forEach(img => {
    img.src = '';
    img.style.display = 'none';
  });
  starMessage.style.display = 'none';

  for (let i = 0; i < 4; i++) {
    await showCountdown(3);
    const dataUrl = takePhoto();
    thumbnails[i].src = dataUrl;
    thumbnails[i].style.display = 'block';
  }

  starMessage.style.display = 'block';
  afterButtons.style.display = 'block';
  startBtn.style.display = 'none';
}

// 5. Gắn sự kiện
startBtn.addEventListener('click', () => {
  takePhotosSequence();
});

retakeBtn.addEventListener('click', () => {
  thumbnails.forEach(img => {
    img.src = '';
    img.style.display = 'none';
  });
  starMessage.style.display = 'none';
  afterButtons.style.display = 'none';
  startBtn.style.display = 'inline-block';
});

editBtn.addEventListener('click', () => {
  mainSection.style.display = 'none';
  editSection.style.display = 'flex';
  renderPhotostrip();
});

retakeFromEditBtn.addEventListener('click', () => {
  editSection.style.display = 'none';
  mainSection.style.display = '';
  thumbnails.forEach(img => {
    img.src = '';
    img.style.display = 'none';
  });
  starMessage.style.display = 'none';
  afterButtons.style.display = 'none';
  startBtn.style.display = 'inline-block';
});

// 6. Dựng photostrip từ ảnh đã chụp
function renderPhotostrip() {
  const preview = document.getElementById('photostripPreview');
  preview.innerHTML = '';
  thumbnails.forEach(img => {
    if (img.src) {
      const photo = document.createElement('img');
      photo.src = img.src;
      preview.appendChild(photo);
    }
  });
}

// === STICKER GẮN LÊN ẢNH ===
const stickerOptions = document.querySelectorAll('.sticker-option');
const photostripPreview = document.getElementById('photostripPreview');
const removeStickersBtn = document.getElementById('removeStickers');

stickerOptions.forEach(sticker => {
  sticker.addEventListener('click', () => {
    const newSticker = document.createElement('img');
    newSticker.src = sticker.src;
    newSticker.classList.add('sticker');
    newSticker.style.left = '20px';
    newSticker.style.top = '20px';

    enableDrag(newSticker);
    photostripPreview.appendChild(newSticker);
  });
});

// Cho sticker kéo được
function enableDrag(sticker) {
  let isDragging = false;
  let offsetX, offsetY;

  sticker.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    sticker.style.zIndex = 100;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = photostripPreview.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;
      sticker.style.left = `${x}px`;
      sticker.style.top = `${y}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    sticker.style.zIndex = 10;
  });
}

// Xóa tất cả sticker
removeStickersBtn.addEventListener('click', () => {
  const allStickers = photostripPreview.querySelectorAll('.sticker');
  allStickers.forEach(s => s.remove());
});

// === ĐỔI MÀU KHUNG VÀ NỀN ===
const frameColors = document.querySelectorAll('#frameColors .color');
const bgColors = document.querySelectorAll('#bgColors .color');

frameColors.forEach(color => {
  color.addEventListener('click', () => {
    frameColors.forEach(c => c.classList.remove('selected'));
    color.classList.add('selected');
    document.querySelectorAll('.photostrip-preview img').forEach(img => {
      img.style.border = `5px solid ${color.dataset.color}`;
    });
  });
});

bgColors.forEach(color => {
  color.addEventListener('click', () => {
    bgColors.forEach(c => c.classList.remove('selected'));
    color.classList.add('selected');
    photostripPreview.style.backgroundColor = color.dataset.color;
  });
});

// === FILTER CHO ẢNH ===
const filterButtons = document.querySelectorAll('.filters button');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.photostrip-preview img').forEach(img => {
      img.style.filter = btn.dataset.filter;
    });
  });
});

// === TẢI XUỐNG PHOTOSTRIP ===
document.getElementById('downloadBtn').addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  const width = 240;
  const height = 4 * 180 + 5 * 10; // ảnh và khoảng cách
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const bg = getComputedStyle(photostripPreview).backgroundColor;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const images = photostripPreview.querySelectorAll('img:not(.sticker)');
  images.forEach((img, i) => {
    const y = i * (180 + 10);
    ctx.filter = img.style.filter || 'none';
    ctx.drawImage(img, 0, y, 240, 180);
  });

  const link = document.createElement('a');
  link.download = 'photostrip.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

function renderPhotostrip() {
  const preview = document.getElementById('photostripPreview');
  preview.innerHTML = '';

  thumbnails.forEach(img => {
    if (img.src) {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.width = '240px';
      wrapper.style.height = '180px';

      const photo = document.createElement('img');
      photo.src = img.src;
      photo.style.width = '100%';
      photo.style.height = '100%';
      photo.style.objectFit = 'cover';
      photo.style.border = '8px solid black';
      photo.style.borderRadius = '10px';

      wrapper.appendChild(photo);

      const sources = {
        'top-left': 'stickers/1.png',
        'top-right': 'stickers/2.png',
        'bottom-left': 'stickers/eat.73b46210.svg',
        'bottom-right': 'stickers/2.png'
      };

      Object.entries(sources).forEach(([corner, src]) => {
        const s = document.createElement('img');
        s.src = src;
        s.classList.add('sticker', corner);
        wrapper.appendChild(s);
      });

      preview.appendChild(wrapper);
    }
  });

  if (document.getElementById('enableDate').checked) {
    const dateEl = document.createElement('div');
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    dateEl.style.color = 'white';
    dateEl.style.textAlign = 'center';
    dateEl.style.fontFamily = 'monospace';
    dateEl.style.fontSize = '16px';
    dateEl.style.padding = '6px 0';
    preview.appendChild(dateEl);
  }
}


// 7. Khởi chạy camera
startCamera();
