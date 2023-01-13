export const uploadPhoto = async (files: FileList) => {
  const data: any = new FormData();
  data.append("file", files[0]);
  const res = await fetch("/api/upload", {
    method: "POST", 
    body: data, 
    // headers: {
    //   "Content-Type": `multipart/form-data; boundary=${data._boundary}`
    // }
  })
  const text = await res.text();
  return text;
}