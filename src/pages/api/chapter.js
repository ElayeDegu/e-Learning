import multer from 'multer';
import cloudinary from '@/utils/cloudinary'; // Assuming cloudinary is set up
import Chapter from '@/models/Chapter';
import db from '@/utils/db';

// Setup Multer for File Uploads
const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit the file size to 10MB
});

export const config = {
  api: {
    bodyParser: false, // Disable Next.js built-in body parser to use multer
  },
};

// Define the API Handler for Chapter Upload
export default async function handler(req, res) {
  await db.connect();

  if (req.method === 'POST') {
    upload.fields([{ name: 'video' }, { name: 'document' }])(req, res, async (err) => {
      if (err) {
        console.error('Multer Error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      }

      const { courseId, title } = req.body;
      const video = req.files.video ? req.files.video[0] : null;
      const document = req.files.document ? req.files.document[0] : null;

      try {
        let videoUrl = '';
        let documentUrl = '';

        if (video) {
          const videoUploadResponse = await cloudinary.uploader.upload(video.path, {
            resource_type: 'video',
            folder: 'course_videos',
          });
          videoUrl = videoUploadResponse.secure_url;
        }

        if (document) {
          const documentUploadResponse = await cloudinary.uploader.upload(document.path, {
            resource_type: 'raw',
            folder: 'course_documents',
          });
          documentUrl = documentUploadResponse.secure_url;
        }

        const chapter = new Chapter({
          courseId,
          title,
          videos: videoUrl ? [videoUrl] : [],
          documents: documentUrl ? [documentUrl] : [],
        });

        await chapter.save();
        res.status(201).json({ message: 'Chapter created successfully', chapterId: chapter._id });
      } catch (error) {
        console.error('Error saving chapter:', error);
        res.status(500).json({ error: 'Chapter creation failed' });
      }
    });
    }else if(req.method === 'GET') {
      try {
        const {courseId} = req.query;
        // Find all chapters for the given courseId
        const chapters = await Chapter.find({ courseId });
  
        if (!chapters) {
          return res.status(404).json({ message: 'No chapters found for this course' });
        }
  
        res.status(200).json(chapters);
      } catch (error) {
        console.error('Error fetching chapters:', error);
        res.status(500).json({ error: 'Error fetching chapters' });
      } 
    } else if(req.method==='DELETE') {
      try {
        const {_id} = req.query;
        // Find and delete the chapter by ID
        
        await Chapter.findByIdAndDelete(_id);
        res.status(200).json({ success: true, message: 'Chapter deleted' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
   
   
}
