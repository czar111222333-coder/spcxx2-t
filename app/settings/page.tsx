export default function SettingsPage() {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">设置</h2>
  
        <div className="bg-white rounded-2xl p-6 shadow max-w-xl space-y-5">
          <div>
            <p className="text-gray-500 mb-2">股票代码</p>
            <input
              value="SPCXX"
              readOnly
              className="w-full border rounded-lg p-3 bg-gray-100 font-bold"
            />
          </div>
  
          <div>
            <p className="text-gray-500 mb-2">手续费率</p>
            <input
              value="0.001"
              readOnly
              className="w-full border rounded-lg p-3 bg-gray-100 font-bold"
            />
          </div>
  
          <div>
            <p className="text-gray-500 mb-2">货币</p>
            <input
              value="USD"
              readOnly
              className="w-full border rounded-lg p-3 bg-gray-100 font-bold"
            />
          </div>
  
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-yellow-800">
            当前版本先固定参数，后面升级为可编辑设置。
          </div>
        </div>
      </div>
    );
  }