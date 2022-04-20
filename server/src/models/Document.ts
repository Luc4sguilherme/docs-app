import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  _id: String,
  data: Object,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model('Document', DocumentSchema);

export async function findOrCreateDocument(id: string) {
  if (id == null) return;

  const defaultValue = '';
  const document = await Document.findById(id);

  if (document) return document;

  return await Document.create({ _id: id, data: defaultValue });
}

export async function saveDocument(documentId: string, data: any) {
  await Document.findByIdAndUpdate(documentId, { data });
}
export default Document;
