import './styles.css';
import 'quill/dist/quill.snow.css';

import Quill, { TextChangeHandler } from 'quill';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import config from '../../config';

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ font: [] }],
  [{ align: [] }, { direction: 'rtl' }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link', 'image'],
  ['clean'],
];

function TextEditor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState<Socket>();
  const [quill, setQuill] = useState<Quill>();

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = document.createElement('div');

    wrapperRef.current?.append(editor);

    const q = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });

    q.disable();
    q.setText('Loading...');
    setQuill(q);

    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const client = io(config.App.host);

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once('load-document', document => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit('get-document', documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return undefined;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return undefined;

    const handler: TextChangeHandler = delta => {
      quill.updateContents(delta);
    };

    socket.on('receive-changes', handler);

    return () => {
      if (socket) {
        socket.off('receive-changes', handler);
      }
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return undefined;

    const handler: TextChangeHandler = (delta, _, source) => {
      if (source !== 'user') return;
      socket.emit('send-changes', delta);
    };

    quill.on('text-change', handler);

    return () => {
      if (quill) {
        quill.off('text-change', handler);
      }
    };
  }, [socket, quill]);

  return <div className="container" ref={wrapperRef} />;
}

export default TextEditor;
