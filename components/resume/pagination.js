(function () {
  const A4_HEIGHT_IN = 11.69;
  const DPI = 96;
  const PAGE_HEIGHT_PX = A4_HEIGHT_IN * DPI;

  const root = document.getElementById("resume-root");
  const nodes = Array.from(root.children);

  root.innerHTML = "";

  let page = createPage();
  let currentHeight = 0;

  nodes.forEach(node => {
    const clone = node.cloneNode(true);
    page.appendChild(clone);

    const nodeHeight = clone.getBoundingClientRect().height;

    if (currentHeight + nodeHeight > PAGE_HEIGHT_PX) {
      page.removeChild(clone);
      root.appendChild(page);

      page = createPage();
      page.appendChild(clone);
      currentHeight = clone.getBoundingClientRect().height;
    } else {
      currentHeight += nodeHeight;
    }
  });

  root.appendChild(page);

  function createPage() {
    const div = document.createElement("div");
    div.className = "resume-page";
    return div;
  }
})();