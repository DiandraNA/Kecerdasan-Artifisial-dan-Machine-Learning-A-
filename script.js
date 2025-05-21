class FaceComparison {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.HASH_SIZE = 32;
        this.setupEventListeners();
    }

    setupEventListeners() {
        ['left', 'right'].forEach(side => {
            const input = document.getElementById(`${side}Input`);
            input.addEventListener('change', (e) => this.handleImageUpload(e, side));
        });
        document.getElementById('compareBtn').addEventListener('click', () => this.compareFaces());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
    }

    handleImageUpload(event, side) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate image file
        if (!file.type.match('image.*')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const displayImg = document.getElementById(`${side}Image`);
                displayImg.src = e.target.result;
                displayImg.style.display = 'block';
                document.getElementById(`${side}Upload`).style.display = 'none';
                // Store in localStorage
                localStorage.setItem(`${side}Image`, e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async getImageData(imgElement) {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                this.canvas.width = this.HASH_SIZE;
                this.canvas.height = this.HASH_SIZE;
                this.ctx.drawImage(image, 0, 0, this.HASH_SIZE, this.HASH_SIZE);
                const imageData = this.ctx.getImageData(0, 0, this.HASH_SIZE, this.HASH_SIZE);
                resolve(imageData.data);
            };
            image.src = imgElement.src;
        });
    }

    async compareFaces() {
        const leftImage = document.getElementById('leftImage');
        const rightImage = document.getElementById('rightImage');
        
        if (!leftImage.src || !rightImage.src) {
            alert('Please upload both images first');
            return;
        }

        try {
            // Wait for both images to load
            await Promise.all([
                new Promise(resolve => {
                    if (leftImage.complete) resolve();
                    else leftImage.onload = resolve;
                }),
                new Promise(resolve => {
                    if (rightImage.complete) resolve();
                    else rightImage.onload = resolve;
                })
            ]);

            // Get image data
            const leftData = await this.getImageData(leftImage);
            const rightData = await this.getImageData(rightImage);

            // Calculate histograms
            const leftHist = this.calculateHistogram(leftData);
            const rightHist = this.calculateHistogram(rightData);

            // Calculate similarity
            const similarity = this.calculateSimilarity(leftHist, rightHist);
            const percentage = Math.min(100, Math.max(0, similarity * 100));

            // Update result
            const scoreElement = document.getElementById('score');
            const resultText = `${percentage.toFixed(2)}% - ${percentage > 50 ? 'Same Person' : 'Different People'}`;
            scoreElement.textContent = resultText;
            scoreElement.className = percentage > 50 ? 'match' : 'no-match';

        } catch (error) {
            console.error('Comparison error:', error);
            alert('Error comparing images. Please try uploading the images again.');
        }
    }

    calculateHistogram(imageData) {
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
            histogram[gray]++;
        }
        // Normalize histogram
        const sum = histogram.reduce((a, b) => a + b, 0);
        return histogram.map(value => value / sum);
    }

    calculateSimilarity(hist1, hist2) {
        let sum = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < hist1.length; i++) {
            sum += hist1[i] * hist2[i];
            norm1 += hist1[i] * hist1[i];
            norm2 += hist2[i] * hist2[i];
        }

        const normalization = Math.sqrt(norm1) * Math.sqrt(norm2);
        return normalization === 0 ? 0 : sum / normalization;
    }

    clearAll() {
        localStorage.clear();
        ['left', 'right'].forEach(side => {
            document.getElementById(`${side}Image`).style.display = 'none';
            document.getElementById(`${side}Upload`).style.display = 'flex';
        });
        document.getElementById('score').textContent = '-';
    }

    hammingDistance(hash1, hash2) {
        return hash1.reduce((acc, curr, i) => acc + (curr !== hash2[i] ? 1 : 0), 0);
    }

    cosineDistance(vec1, vec2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (norm1 * norm2);
    }
}

new FaceComparison();
