/**
 * Multimodal Processor
 * Handles image and video processing for AI-powered trip planning
 * Supports file uploads, URL processing, and media analysis
 */

const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class MultimodalProcessor {
  constructor(options = {}) {
    this.uploadDir = options.uploadDir || path.join(process.cwd(), 'uploads');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.allowedImageTypes = options.allowedImageTypes || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
    this.allowedVideoTypes = options.allowedVideoTypes || [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm'
    ];
    
    // Ensure upload directory exists
    this.initializeUploadDir();
  }

  /**
   * Initialize upload directory
   */
  async initializeUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log(`📁 Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Validate file type
   * @param {string} mimeType - File MIME type
   * @param {string} mediaType - 'image' or 'video'
   * @returns {boolean}
   */
  isValidFileType(mimeType, mediaType) {
    if (mediaType === 'image') {
      return this.allowedImageTypes.includes(mimeType);
    } else if (mediaType === 'video') {
      return this.allowedVideoTypes.includes(mimeType);
    }
    return false;
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @returns {string} Unique filename
   */
  generateFilename(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Process uploaded file buffer
   * @param {Buffer} buffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Processing result
   */
  async processFileBuffer(buffer, originalName, mimeType) {
    try {
      // Validate file size
      if (buffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
      }

      // Determine media type
      const mediaType = mimeType.startsWith('image/') ? 'image' : 'video';
      
      // Validate file type
      if (!this.isValidFileType(mimeType, mediaType)) {
        throw new Error(`Invalid ${mediaType} type: ${mimeType}`);
      }

      // Generate unique filename
      const filename = this.generateFilename(originalName);
      const filepath = path.join(this.uploadDir, filename);

      // Save file
      await fs.writeFile(filepath, buffer);

      // Extract metadata
      const metadata = {
        filename,
        originalName,
        mimeType,
        mediaType,
        size: buffer.length,
        path: filepath,
        url: `/uploads/${filename}`,
        uploadedAt: new Date().toISOString()
      };

      // Additional processing based on type
      if (mediaType === 'image') {
        metadata.analysis = await this.analyzeImage(filepath, mimeType);
      } else if (mediaType === 'video') {
        metadata.analysis = await this.analyzeVideo(filepath, mimeType);
      }

      console.log(`✅ Processed ${mediaType}: ${filename} (${(buffer.length / 1024).toFixed(2)}KB)`);

      return {
        success: true,
        metadata,
        message: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} processed successfully`
      };

    } catch (error) {
      console.error('File processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process file from URL
   * @param {string} url - File URL
   * @param {string} mediaType - 'image' or 'video'
   * @returns {Promise<Object>} Processing result
   */
  async processFileFromUrl(url, mediaType) {
    try {
      console.log(`📥 Downloading ${mediaType} from URL: ${url}`);
      
      const response = await fetch(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Maya-Travel-Agent/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type');
      const urlPath = new URL(url).pathname;
      const originalName = path.basename(urlPath) || `download_${Date.now()}`;

      return await this.processFileBuffer(buffer, originalName, contentType);

    } catch (error) {
      console.error('URL processing error:', error);
      return {
        success: false,
        error: error.message,
        url
      };
    }
  }

  /**
   * Analyze image (basic metadata extraction)
   * @param {string} filepath - Path to image file
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(filepath, mimeType) {
    // Basic analysis - in production, could use sharp or jimp for detailed analysis
    try {
      const stats = await fs.stat(filepath);
      return {
        type: 'image',
        format: mimeType.split('/')[1],
        sizeBytes: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        // Placeholder for advanced analysis
        features: ['travel', 'destination', 'landmark'],
        confidence: 0.85
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Analyze video (basic metadata extraction)
   * @param {string} filepath - Path to video file
   * @param {string} mimeType - Video MIME type
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeVideo(filepath, mimeType) {
    // Basic analysis - in production, could use ffmpeg for detailed analysis
    try {
      const stats = await fs.stat(filepath);
      return {
        type: 'video',
        format: mimeType.split('/')[1],
        sizeBytes: stats.size,
        sizeMB: (stats.size / 1024 / 1024).toFixed(2),
        // Placeholder for advanced analysis
        estimatedDuration: '30s',
        features: ['travel', 'tourism', 'activity'],
        confidence: 0.80
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Prepare media for AI analysis
   * @param {Array<string>} imageUrls - Image URLs or paths
   * @param {string|null} videoUrl - Video URL or path
   * @returns {Promise<Object>} Prepared media data
   */
  async prepareMediaForAI(imageUrls = [], videoUrl = null) {
    const prepared = {
      images: [],
      video: null,
      totalSize: 0,
      mediaCount: 0
    };

    // Process images
    for (const url of imageUrls) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // External URL - keep as is
        prepared.images.push({ url, type: 'url' });
      } else if (url.startsWith('/uploads/')) {
        // Local file
        const filepath = path.join(this.uploadDir, path.basename(url));
        try {
          const stats = await fs.stat(filepath);
          prepared.images.push({
            url,
            type: 'local',
            size: stats.size
          });
          prepared.totalSize += stats.size;
        } catch (error) {
          console.error(`Failed to stat image: ${url}`, error);
        }
      }
    }

    // Process video
    if (videoUrl) {
      if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
        prepared.video = { url: videoUrl, type: 'url' };
      } else if (videoUrl.startsWith('/uploads/')) {
        const filepath = path.join(this.uploadDir, path.basename(videoUrl));
        try {
          const stats = await fs.stat(filepath);
          prepared.video = {
            url: videoUrl,
            type: 'local',
            size: stats.size
          };
          prepared.totalSize += stats.size;
        } catch (error) {
          console.error(`Failed to stat video: ${videoUrl}`, error);
        }
      }
    }

    prepared.mediaCount = prepared.images.length + (prepared.video ? 1 : 0);

    return prepared;
  }

  /**
   * Clean up old files (older than specified days)
   * @param {number} days - Number of days to keep files
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupOldFiles(days = 7) {
    try {
      const files = await fs.readdir(this.uploadDir);
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      let deletedCount = 0;
      let freedSpace = 0;

      for (const file of files) {
        const filepath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtimeMs < cutoffTime) {
          freedSpace += stats.size;
          await fs.unlink(filepath);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleanup: Deleted ${deletedCount} files, freed ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);

      return {
        success: true,
        deletedCount,
        freedSpaceMB: (freedSpace / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Cleanup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage stats
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(this.uploadDir);
      let totalSize = 0;
      let imageCount = 0;
      let videoCount = 0;

      for (const file of files) {
        const filepath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filepath);
        totalSize += stats.size;

        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          imageCount++;
        } else if (['.mp4', '.mpeg', '.mov', '.avi', '.webm'].includes(ext)) {
          videoCount++;
        }
      }

      return {
        totalFiles: files.length,
        imageCount,
        videoCount,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        uploadDir: this.uploadDir
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
}

module.exports = MultimodalProcessor;
