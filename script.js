const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    authDomain: "m-legacy-5cf2b.firebaseapp.com",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com",
    projectId: "m-legacy-5cf2b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas'), ctx = cv.getContext('2d');
const mover = document.getElementById('mover'), viewport = document.getElementById('viewport');
const blockW = 40, blockH = 25, cols = 100, rows = 50; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.22, pX = 0, pY = 0, pixels = {};
const imgCache = {};

function render() {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#eee"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke(); }

    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            if (!imgCache[p.imageUrl]) {
                const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
                img.onload = () => { imgCache[p.imageUrl] = img; ctx.drawImage(img, p.x, p.y, blockW, blockH); };
            } else { ctx.drawImage(imgCache[p.imageUrl], p.x, p.y, blockW, blockH); }
        }
    });
}

function searchPlot() {
    const id = parseInt(document.getElementById('searchInput').value);
    if (!id || id < 1 || id > 5000) return alert("Select 1-5000");
    const r = Math.floor((id-1)/cols), c = (id-1)%cols;
    scale = 3.5;
    pX = (viewport.clientWidth/2) - (c*blockW*scale) - (blockW*scale/2);
    pY = (viewport.clientHeight/2) - (r*blockH*scale) - (blockH*scale/2);
    mover.style.transition = "transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)";
    mover.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`;
}

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    const sold = Object.keys(pixels).length;
    document.getElementById('sold-count').innerText = sold;
    document.getElementById('rem-count').innerText = 5000 - sold;
    render();
});

function copyVal(v) { navigator.clipboard.writeText(v).then(()=>alert("Copied!")); }
