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
  const { materials, accidents, addMaterial, updateMaterial } = useAppStore();
  const [selectedAccident, setSelectedAccident] = useState(accidents[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const currentMaterial = materials.find(m => m.id === showRejectModal);

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

  const handleApprove = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const updatedMaterial: Material = {
      ...material,
      auditStatus: 'approved',
      auditRemark: '审核通过'
    };
    updateMaterial(updatedMaterial);
  };

  const handleOpenReject = (materialId: string) => {
    setShowRejectModal(materialId);
    setRejectReason('');
  };

  const handleReject = () => {
    if (!currentMaterial || !rejectReason.trim()) return;

    const updatedMaterial: Material = {
      ...currentMaterial,
      auditStatus: 'rejected',
      auditRemark: rejectReason.trim()
    };
    updateMaterial(updatedMaterial);
    setShowRejectModal(null);
    setRejectReason('');
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMaterials.map((material) => {
                const Icon = typeIcons[material.type];
                return (
                  <div key={material.id} className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-all hover:shadow-md">
                    <div className="aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
                      {material.type === 'photo' ? (
                        <img 
                          src={material.url} 
                          alt={material.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : material.type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                          <Icon className="w-12 h-12 mb-2 opacity-80" />
                          <span className="text-xs opacity-60">点击播放</span>
                        </div>
                      ) : (
                        <Icon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                          {typeLabels[material.type]}
                        </span>
                        <StatusBadge status={material.auditStatus} />
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate" title={material.name}>
                        {material.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(material.uploadTime)}
                      </p>
                      {material.auditRemark && material.auditStatus !== 'pending' && (
                        <div className={`mt-2 p-2 text-xs rounded-lg ${
                          material.auditStatus === 'approved' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className="font-medium">审核备注：</span>
                          {material.auditRemark}
                        </div>
                      )}
                    </div>
                    {material.auditStatus === 'pending' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button 
                          className="p-3 bg-white rounded-full text-green-600 hover:text-green-700 hover:bg-green-50 shadow-lg transition-all"
                          onClick={() => handleApprove(material.id)}
                          title="审核通过"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-3 bg-white rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 shadow-lg transition-all"
                          onClick={() => handleOpenReject(material.id)}
                          title="审核驳回"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
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

      {showRejectModal && currentMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">材料审核驳回</h3>
              <button onClick={() => setShowRejectModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  材料：<span className="font-medium">{currentMaterial.name}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">驳回原因 <span className="text-red-500">*</span></label>
                <textarea 
                  className="input-field h-32"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请填写驳回原因，例如：材料不清晰、缺少关键信息、与事故无关等"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowRejectModal(null)} className="btn-secondary">取消</button>
              <button 
                onClick={handleReject} 
                className="btn-accent"
                disabled={!rejectReason.trim()}
              >
                <X className="w-4 h-4 mr-2 inline" />
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
