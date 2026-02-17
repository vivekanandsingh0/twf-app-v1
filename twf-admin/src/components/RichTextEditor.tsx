"use client";

import React, { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    label: string;
}

export default function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync value to contentEditable when value changes externally (and not focused to avoid cursor jumping)
    useEffect(() => {
        if (contentRef.current && document.activeElement !== contentRef.current && contentRef.current.innerHTML !== value) {
            contentRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (contentRef.current) {
            onChange(contentRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        contentRef.current?.focus();
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">
                {label}
            </label>

            <div className={`
        border-2 rounded-xl overflow-hidden transition-all duration-300
        ${isFocused ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-200'}
      `}>
                {/* Toolbar */}
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 flex-wrap items-center">
                    <ToolbarButton onClick={() => execCommand('bold')} icon="𝐁" title="Bold" />
                    <ToolbarButton onClick={() => execCommand('italic')} icon="𝐼" title="Italic" />
                    <ToolbarButton onClick={() => execCommand('underline')} icon="U̲" title="Underline" />
                    <div className="w-px h-6 bg-slate-300 mx-1" />
                    <ToolbarButton onClick={() => execCommand('justifyLeft')} icon="⫷" title="Align Left" />
                    <ToolbarButton onClick={() => execCommand('justifyCenter')} icon="☰" title="Align Center" />
                    <ToolbarButton onClick={() => execCommand('justifyRight')} icon="⫸" title="Align Right" />
                    <div className="w-px h-6 bg-slate-300 mx-1" />
                    <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon="1." title="Ordered List" />
                    <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon="•" title="Unordered List" />
                    <div className="w-px h-6 bg-slate-300 mx-1" />
                    <ToolbarButton onClick={() => {
                        const url = prompt('Enter link URL:');
                        if (url) execCommand('createLink', url);
                    }} icon="🔗" title="Link" />
                    <ToolbarButton onClick={() => execCommand('unlink')} icon="⛓️‍💥" title="Unlink" />
                    <div className="w-px h-6 bg-slate-300 mx-1" />
                    <select
                        onChange={(e) => execCommand('formatBlock', e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-emerald-500"
                        defaultValue="p"
                    >
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="blockquote">Quote</option>
                    </select>
                </div>

                {/* Editor Area */}
                <div
                    ref={contentRef}
                    contentEditable
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="min-h-[300px] p-4 outline-none prose prose-indigo max-w-none text-slate-700"
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">
                {placeholder || 'Start typing...'}
            </p>
        </div>
    );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void; icon: string; title: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="p-1.5 w-8 h-8 rounded hover:bg-slate-200 text-slate-600 hover:text-emerald-700 transition-colors flex items-center justify-center font-bold text-sm"
        >
            {icon}
        </button>
    );
}
