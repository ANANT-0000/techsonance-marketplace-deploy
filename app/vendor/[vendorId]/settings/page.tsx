'use client';
import { useState } from "react";

export default function VendorProfilePage() {
  const [bandImg, setBandImg] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
  });
  const saveChanges = () => {
    console.log(formData, bandImg)
  }
  return (
    <>


      <main className={`mt-6 `}>

        <section className="vendor_settings_content ml-70 p-6 bg-white rounded-lg border-2 border-gray-300 ">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold mb-4">Store Profile</h2>
            <button onClick={saveChanges} className="px-6 py-2 bg-blue-500 text-white font-medium rounded-xl" >Save Changes</button>
          </div>

          <section className="space-y-4 flex justify-between gap-12">
            <div className="band-image-section mb-4 ">
              {
                bandImg ? (
                  <img src={URL.createObjectURL(bandImg)} alt="band img" className="w-56 h-56 rounded-lg border-2 border-gray-300" />
                ) : (
                  <label className="flex flex-col items-center justify-center w-56 h-56 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="file" name="bandImg" id="bandImg" onChange={(e) => setBandImg(e.target.files ? e.target.files[0] : null)} accept="image/*" className="hidden" />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>

                      <p className="mb-1 text-sm text-gray-500 font-semibold">Click to upload image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, Video up to 10MB</p>
                    </div>
                  </label>
                )
              }


            </div>

            <span className="flex-1 flex flex-col gap-4">
              <div className="my-0">
                <label className="block text-gray-700 mb-2 font-bold">Store Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter store name" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
                <p className="mt-2 text-sm text-gray-500">This name will be visible to customers on your storefront.</p>
              </div>
              <div className="my-1">
                <label className="block text-gray-700 mb-2 font-bold">Store Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg py-2 px-4" placeholder="Enter store description" value={formData.storeDescription} onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}></textarea>
              </div>
            </span>
          </section>
        </section>
      </main>
    </>
  )
}
