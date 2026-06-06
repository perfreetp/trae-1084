import { useState, useRef } from 'react';
import {
  Upload,
  Image,
  Video,
  FileText,
  Database,
  Check,
  X,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatDateTime, generateId } from '../../utils';
import type { Material } from '../../types';

const Materials = () => {
  const { materials, accidents, addMaterial } = useAppStore();
  const [selectedAccident, setSelectedAccident] = useState(accidents[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const typeIcons: Record<string, any> = {
    photo: Image,
    video: Video,
    document: FileText,
    flight_data: Database
  };

  const typeLabels: Record<string, string> = {
    photo: '照片',
    video: '视频',
    document: '证件',
    flight_data: '飞行数据'
  };

  const filteredMaterials = materials.filter(m => m.accidentId === selectedAccident);

  const getFileType = (fileName: string): 'photo' | 'video' | 'document' | 'flight_data' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'photo';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) return 'video';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext || '')) return 'document';
    return 'flight_data';
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedAccident) return;

    Array.from(files).forEach(file => {
      const fileType = getFileType(file.name);
      const newMaterial: Material = {
        id: generateId(),
        accidentId: selectedAccident,
        type: fileType,
        url: URL.createObjectURL(file),
        name: file.name,
        uploadTime: new Date().toISOString(),
        auditStatus: 'pending'
      };
      addMaterial(newMaterial);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <PageHeader
        title="材料收集"
        description="上传和管理事故相关材料，查看审核状态。"
        actions={
          <button className="btn-primary" onClick={handleSelectFileClick}>
            <Upload className="w-4 h-4 mr-2 inline" />
            批量上传
          </button>
        }
      />

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">选择报案：</label>
          <select
            value={selectedAccident}
            onChange={(e) => setSelectedAccident(e.target.value)}
            className="input-field max-w-md"
          >
            {accidents.map(accident => (
              <option key={accident.id} value={accident.id}>
                {accident.reportNo} - {accident.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {accidents.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无报案记录，请先创建报案</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(typeLabels).map(([type, label]) => {
              const count = filteredMaterials.filter(m => m.type === type).length;
              const Icon = typeIcons[type];
              return (
                <div key={type} className="card text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary-700" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              );
            })}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div className="mb-6">
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer bg-gray-50 ${
                dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleSelectFileClick}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragging ? 'text-primary-600' : 'text-gray-400'}`} />
              <p className="text-lg font-medium text-gray-700 mb-2">拖拽文件到此处上传</p>
              <p className="text-sm text-gray-500 mb-4">支持 JPG、PNG、MP4、PDF 等格式，单文件不超过 100MB</p>
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleSelectFileClick(); }}>
                <Plus className="w-4 h-4 mr-2 inline" />
                选择文件
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">已上传材料 ({filteredMaterials.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMaterials.map((material) => {
                const Icon = typeIcons[material.type];
                return (
                  <div key={material.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 hover:bg-gray-200 transition-colors">
                      {material.type === 'photo' ? (
                        <img 
                          src={material.url} 
                          alt={material.name} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <Icon className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-600 text-center truncate w-full">{material.name}</p>
                        </>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={material.auditStatus} />
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                      {formatDateTime(material.uploadTime).split(' ')[1]}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <button className="p-2 bg-white rounded-full text-gray-600 hover:text-primary-700">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full text-gray-600 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredMaterials.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无上传材料，请上传相关证明文件</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Materials;
