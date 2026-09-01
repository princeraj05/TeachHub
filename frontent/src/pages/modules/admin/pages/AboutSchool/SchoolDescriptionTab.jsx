import React from "react";
import {
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaEye,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaLink,
  FaImage,
  FaVideo,
  FaUndo,
  FaRedo,
  FaEdit
} from "react-icons/fa";

function SchoolDescriptionTab({
  description, setDescription,
  schoolName
}) {

  // Clean description string to get accurate characters & words
  const strippedText = description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  const charCount = strippedText.length;
  const wordCount = strippedText.trim() === "" ? 0 : strippedText.trim().split(/\s+/).length;

  // Real-time Strength checklist
  const hasMinLength = charCount >= 150;
  const hasHeadings = /<h[1-6]>/i.test(description) || /<strong>/i.test(description) || /<b>/i.test(description);
  const hasLists = /<li/i.test(description) || /<ul>/i.test(description) || /<ol>/i.test(description);
  const isFriendly = charCount > 50; // simple proxy

  let strengthScore = 20; // base score
  if (hasMinLength) strengthScore += 25;
  if (hasHeadings) strengthScore += 20;
  if (hasLists) strengthScore += 20;
  if (isFriendly) strengthScore += 0;

  // Determine progress color
  let progressColor = "bg-rose-500";
  if (strengthScore >= 80) progressColor = "bg-emerald-500";
  else if (strengthScore >= 50) progressColor = "bg-amber-500";

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById("school-description-editor");
    if (editor) {
      setDescription(editor.innerHTML);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fadeIn">
      
      {/* EDIT SCHOOL DESCRIPTION CARD (7 Cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
            <FaEdit className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Edit School Description</h3>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">Use the editor below to write about your school.</p>

          {/* CUSTOM RICH TEXT EDITOR TOOLBAR */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
            
            {/* Toolbar Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#131B35]/40 select-none">
              <select
                onChange={(e) => handleFormat("formatBlock", e.target.value)}
                className="text-[10px] font-bold text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded cursor-pointer outline-none"
              >
                <option value="p">Paragraph</option>
                <option value="h3">Heading (H3)</option>
                <option value="h4">Subheading (H4)</option>
              </select>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />
              <button type="button" onClick={() => handleFormat("bold")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Bold"><FaBold /></button>
              <button type="button" onClick={() => handleFormat("italic")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Italic"><FaItalic /></button>
              <button type="button" onClick={() => handleFormat("underline")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Underline"><FaUnderline /></button>
              <button type="button" onClick={() => handleFormat("strikeThrough")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Strikethrough"><FaStrikethrough /></button>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />
              <button type="button" onClick={() => handleFormat("insertUnorderedList")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Bullet List"><FaListUl /></button>
              <button type="button" onClick={() => handleFormat("insertOrderedList")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Numbered List"><FaListOl /></button>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />
              <button type="button" onClick={() => handleFormat("justifyLeft")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Align Left"><FaAlignLeft /></button>
              <button type="button" onClick={() => handleFormat("justifyCenter")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Align Center"><FaAlignCenter /></button>
              <button type="button" onClick={() => handleFormat("justifyRight")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Align Right"><FaAlignRight /></button>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />
              <button type="button" onClick={() => handleFormat("undo")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Undo"><FaUndo /></button>
              <button type="button" onClick={() => handleFormat("redo")} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-[10px]" title="Redo"><FaRedo /></button>
            </div>

            {/* WYSIWYG contentEditable Rich Text Area */}
            <div
              id="school-description-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setDescription(e.currentTarget.innerHTML)}
              onBlur={(e) => setDescription(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: description }}
              className="w-full min-h-[240px] max-h-[380px] overflow-y-auto p-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-xs font-medium leading-relaxed prose dark:prose-invert max-w-none"
            />
          </div>

          {/* Counts & Status Footer */}
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-4 select-none">
            <span>Words: {wordCount} &nbsp;&bull;&nbsp; Characters: {charCount}</span>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wide">
                Live Rich Text Editor
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN CARDS (5 Cols) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        
        {/* PREVIEW CONTAINER */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
            <FaEye className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Preview</h3>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-3">This is how your description will appear to students and parents.</p>

          <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-slate-50 dark:bg-[#0F172A]/40 min-h-[160px] max-h-56 overflow-y-auto">
            {/* HTML Description preview container */}
            <div
              className="prose dark:prose-invert prose-xs text-xs text-slate-800 dark:text-slate-300 font-medium leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: description || `<p className="text-slate-400 italic">Provide a description in the editor to see it here.</p>` }}
            />
            
            <button
              type="button"
              className="mt-4 text-[9px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Page Preview &rarr;
            </button>
          </div>
        </div>

        {/* DESCRIPTION STRENGTH */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Description Strength</h3>
            <span className="text-xs font-black text-slate-900 dark:text-white">{strengthScore}%</span>
          </div>

          <div className="space-y-4">
            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className={`${progressColor} h-full transition-all duration-300`} style={{ width: `${strengthScore}%` }} />
            </div>

            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
              {strengthScore >= 80 ? "Great description! You're doing excellent." : "Try adding more detail to improve description strength."}
            </p>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span className={hasMinLength ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}>✓</span>
                <span className={hasMinLength ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-450"}>Minimum 150 characters</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span className={hasHeadings ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}>✓</span>
                <span className={hasHeadings ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-450"}>You have used headings</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-350">
                <span className={hasLists ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}>✓</span>
                <span className={hasLists ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-450"}>You have used lists</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-350">
                <span className={isFriendly ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}>✓</span>
                <span className={isFriendly ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-450"}>Description is student & parent friendly</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <FaExclamationTriangle className="text-amber-500 text-[9px] shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">Add more about facilities (optional)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TIPS FOR BETTER DESCRIPTION */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-3">
            <FaLightbulb className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Tips for Better Description</h3>
          </div>
          <ul className="space-y-2 text-[10px] font-medium text-slate-600 dark:text-slate-400 list-disc list-inside leading-relaxed">
            <li>Explain your teaching philosophy</li>
            <li>Mention your facilities</li>
            <li>Add achievements</li>
            <li>Keep it clear and simple</li>
            <li>Use headings and lists</li>
          </ul>
        </div>

      </div>

      {/* Info warning banner */}
      <div className="lg:col-span-12 bg-purple-50 dark:bg-[#0F172A] border border-purple-200 dark:border-slate-850 rounded-xl px-4 py-3.5 text-xs text-slate-700 dark:text-slate-350 mt-4 flex items-center gap-2.5">
        <FaInfoCircle className="text-purple-500 text-base" />
        <span>This description will be visible to students and parents on the school profile page.</span>
      </div>

    </div>
  );
}

// Chevron helper
function FaChevronDown(props) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" {...props}>
      <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
    </svg>
  );
}

export default SchoolDescriptionTab;
