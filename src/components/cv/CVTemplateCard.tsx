import React from 'react';
import { type CVTemplate } from '../../types/cv.type';
import { Button } from '../../components/ui/button';

interface CVTemplateCardProps {
  template: CVTemplate;
  onPreview: (template: CVTemplate) => void;
  onUse: (template: CVTemplate) => void;
}

export const CVTemplateCard: React.FC<CVTemplateCardProps> = ({ template, onPreview, onUse }) => {
  // Trình bày giao diện thu nhỏ (mockup layout) trực tiếp bằng HTML/CSS mô phỏng chuẩn xác thiết kế
  const renderMockup = () => {
    switch (template.id) {
      case 1: // executive-standard
        return (
          <div className="w-full h-full bg-white p-4 flex flex-col justify-between text-[4px] leading-[6px] text-slate-400 select-none">
            <div>
              {/* Header */}
              <div className="border-b-[1px] border-slate-100 pb-2 mb-3">
                <div className="font-extrabold text-slate-850 text-[10px] leading-none mb-1 font-sans">CV</div>
                <div className="w-12 h-1 bg-slate-350 rounded-sm mb-1"></div>
                <div className="w-20 h-1 bg-slate-200 rounded-sm"></div>
              </div>
              {/* Section 1 */}
              <div className="mb-3">
                <div className="w-8 h-1 bg-slate-400 rounded-sm mb-1.5 font-bold"></div>
                <div className="space-y-1">
                  <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                  <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
                  <div className="w-4/5 h-0.5 bg-slate-100 rounded-sm"></div>
                </div>
              </div>
              {/* Section 2 */}
              <div className="mb-3">
                <div className="w-12 h-1 bg-slate-400 rounded-sm mb-1.5 font-bold"></div>
                <div className="space-y-1">
                  <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                  <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
                </div>
              </div>
            </div>
            {/* Footer mockup */}
            <div className="flex justify-between items-center text-[3px] border-t-[1px] border-slate-50 pt-2 text-slate-300">
              <span>ATS Friendly</span>
              <span>1 Page</span>
            </div>
          </div>
        );
      case 2: // corporate-split
        return (
          <div className="w-full h-full bg-white p-4 flex text-[4px] leading-[6px] text-slate-400 select-none">
            {/* Left Sidebar */}
            <div className="w-[32%] border-r-[1px] border-slate-100 pr-1.5 mr-1.5 flex flex-col justify-between">
              <div>
                <div className="w-6 h-6 rounded-full bg-slate-200 mb-2 mx-auto"></div>
                <div className="w-10 h-0.5 bg-slate-400 rounded-sm mb-2 mx-auto"></div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="w-6 h-0.5 bg-slate-150"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="w-8 h-0.5 bg-slate-150"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="w-5 h-0.5 bg-slate-150"></div>
                  </div>
                </div>
              </div>
              <div className="text-[3px] text-slate-300 tracking-wider">SAM BASE WORK</div>
            </div>
            {/* Right Main Body */}
            <div className="w-[68%] flex flex-col justify-between">
              <div>
                <div className="border-b-[1px] border-slate-100 pb-1.5 mb-2">
                  <div className="w-16 h-1 bg-slate-500 rounded-sm mb-1"></div>
                  <div className="w-24 h-0.5 bg-slate-200 rounded-sm"></div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="w-10 h-1 bg-slate-400 rounded-sm mb-1"></div>
                    <div className="space-y-1">
                      <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                      <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
                    </div>
                  </div>
                  <div>
                    <div className="w-12 h-1 bg-slate-400 rounded-sm mb-1"></div>
                    <div className="space-y-1">
                      <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                      <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3: // tech-minimal
        return (
          <div className="w-full h-full bg-[#1F242D] p-4 flex flex-col justify-between text-[4px] leading-[6px] text-slate-300 select-none">
            <div>
              {/* Header */}
              <div className="border-b-[1px] border-slate-700 pb-2 mb-3">
                <div className="font-extrabold text-[#D5A153] text-[12px] leading-none mb-1 font-serif">CV</div>
                <div className="w-12 h-1 bg-slate-400 rounded-sm mb-1"></div>
                <div className="w-20 h-0.5 bg-slate-500 rounded-sm"></div>
              </div>
              {/* Section 1 */}
              <div className="mb-3">
                <div className="w-12 h-1 text-[#D5A153] rounded-sm mb-1.5 font-bold font-mono">EXPERIENCE</div>
                <div className="space-y-1">
                  <div className="w-full h-0.5 bg-slate-600 rounded-sm"></div>
                  <div className="w-5/6 h-0.5 bg-slate-600 rounded-sm"></div>
                  <div className="w-4/5 h-0.5 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              {/* Yellow Button Highlight */}
              <div className="my-2 py-0.5 bg-[#D5A153] text-[#1F242D] text-[3px] text-center rounded-[1px] font-bold tracking-wider">
                PORTFOLIO
              </div>
              {/* Section 2 */}
              <div>
                <div className="w-10 h-1 text-[#D5A153] rounded-sm mb-1.5 font-bold font-mono">SKILLS</div>
                <div className="space-y-1">
                  <div className="w-11/12 h-0.5 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4: // consultant-pro
        return (
          <div className="w-full h-full bg-white p-4 flex flex-col justify-between text-[4px] leading-[6px] text-slate-400 select-none">
            <div>
              {/* Header */}
              <div className="mb-3">
                <div className="font-serif text-[11px] font-bold text-slate-900 leading-none mb-1">CVM</div>
                <div className="w-16 h-[1.5px] bg-slate-800 rounded-sm mb-1"></div>
                <div className="w-24 h-0.5 bg-slate-300 rounded-sm"></div>
              </div>
              {/* Split layout simulation */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1.5 border-r-[0.5px] border-slate-100 pr-1">
                  <div className="w-8 h-1 bg-slate-500 rounded-sm font-bold">CONTACT</div>
                  <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                  <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div>
                    <div className="w-12 h-1 bg-slate-500 rounded-sm mb-1 font-bold">EDUCATION</div>
                    <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                    <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
                  </div>
                  <div>
                    <div className="w-14 h-1 bg-slate-500 rounded-sm mb-1 font-bold">PROJECTS</div>
                    <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer with dark banner mock */}
            <div className="bg-[#0F172A] text-white text-[3px] py-0.5 text-center font-bold tracking-widest rounded-sm">
              SAFE SI WORK
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-slate-100 rounded-sm flex items-center justify-center">
            <span className="text-xs text-slate-400 font-semibold">{template.name}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">

      {/* Thumbnail area */}
      <div className="relative aspect-[3/4] p-6 bg-slate-50/50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
        {/* Huy hiệu MỚI */}
        {template.isNew && (
          <span className="absolute top-4 left-4 z-10 inline-flex items-center px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold tracking-widest rounded-[2px] shadow-sm uppercase">
            Mới
          </span>
        )}

        {/* Animated container */}
        <div className="w-[144px] h-[192px] transition-transform duration-300 group-hover:scale-[1.03] shadow-md hover:shadow-lg border border-slate-200/40 rounded-sm overflow-hidden bg-white">
          {renderMockup()}
        </div>
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-[15px] font-bold text-slate-900 mb-1.5 font-sans group-hover:text-slate-800 transition-colors">
          {template.name}
        </h4>
        <p className="text-xs text-slate-400 font-sans leading-relaxed mb-5 flex-grow">
          {template.description}
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button
            onClick={() => onPreview(template)}
            variant="outline"
            size="sm"
            className="text-[11px] font-bold tracking-wider rounded-[4px]"
          >
            XEM TRƯỚC
          </Button>
          <Button
            onClick={() => onUse(template)}
            variant="default"
            size="sm"
            className="text-[11px] font-bold tracking-wider rounded-[4px]"
          >
            SỬ DỤNG
          </Button>
        </div>
      </div>

    </div>
  );
};
