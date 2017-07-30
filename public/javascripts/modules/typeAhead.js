import axios from "axios";
import { $, $$, l } from "./bling";

const searchHtml = stores => {
  return stores
    .map((store, i) => {
      return `
      <a href=/store/${store.slug} class="search__result ${(i == 0 &&
        "search__result--active") ||
        ""}"> 
        <strong>${store.name}</strong> 
      </a>
    `;
    })
    .join("");
};

export default search => {
  if (!search) return;
  const searchInput = $(".search__input");
  const searchResults = $(".search__results");

  searchInput.on("input", e => {
    const value = e.target.value.trim();
    if (!value) {
      // if there is no value hide the result and return
      searchResults.style.display = "none";
      return;
    }
    searchResults.style.display = "block";
    searchResults.innerHTML = "";
    axios
      .get(`/api/search?q=${value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = searchHtml(res.data);
        } else {
          searchResults.innerHTML = `
          <div class="search__result">
            <strong>No result to show</strong> 
          </div>
          `;
        }
      })
      .catch(e => console.error(e));
  });

  // freeze cursor in place on key up and down ..
  searchInput.on("keydown", e => {
    if (e.keyCode == "38" || e.keyCode == "40") {
      e.preventDefault();
    }
  });

  // use up/down enter  38/40 13
  searchInput.on("keyup", e => {
    if (
      [38, 40, 13].indexOf(e.keyCode) < 0 ||
      !$(".search__results").children.length
    )
      return;

    let selected = $(".search__results > .search__result--active");

    if (e.keyCode == 13) {
      if (selected) window.location.href = selected;
    }

    const searchResults = $(".search__results");
    const elements = searchResults.children;

    if (e.keyCode == 40) {
      const nextSibling = selected.nextElementSibling;
      if (nextSibling) {
        selected.classList.remove("search__result--active");
        nextSibling.classList.add("search__result--active");
        selected = $(".search__results > .search__result--active");
      } else {
        selected.classList.remove("search__result--active");
        elements[0].classList.add("search__result--active");
        selected = $(".search__results > .search__result--active");
      }
    }

    if (e.keyCode == 38) {
      const previousSibling = selected.previousSibling.previousSibling;
      if (previousSibling) {
        selected.classList.remove("search__result--active");
        previousSibling.classList.add("search__result--active");
        selected = $(".search__results > .search__result--active");
      } else {
        selected.classList.remove("search__result--active");
        elements[elements.length - 1].classList.add("search__result--active");
        selected = $(".search__results > .ssearch__result--active");
      }
    }
  });
};
