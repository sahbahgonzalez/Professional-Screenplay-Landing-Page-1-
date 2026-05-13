export function getContactEmail(): string {
  const savedContent = localStorage.getItem("contentData");
  if (savedContent) {
    try {
      const contentData = JSON.parse(savedContent);
      return contentData.contactEmail || "contact@truthprotocol.com";
    } catch (e) {
      return "contact@truthprotocol.com";
    }
  }
  return "contact@truthprotocol.com";
}
