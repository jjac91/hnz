"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  
  const hostName = story.getHostName();

  const showStar = Boolean(currentUser)

  return $(`
      <li id="${story.storyId}">
      ${showStar ? getStar(story,currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getStar(story, user){
  const isFavorite = user.isFavorite(story)
  const starVersion = isFavorite ? "fas" : "far"
  return `
    <span class="fav-icon">
      <i class = "${starVersion} fa-star"></i>
      </span>`
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}



async function submitNewStory(e){
  e.preventDefault();

  const author = $("#author").val()
  const title = $("#title").val()
  const url = $("#url").val()
  const username = currentUser.username
  const data = {title, author, url, username}

  const story = await storyList.addStory(currentUser, data)
  
  const $story =generateStoryMarkup(story)
  $allStoriesList.prepend($story)

  $submitForm.trigger("reset")
  console.log ("sumbitted")
}

$submitForm.on("submit", submitNewStory)

//favorites
function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStories.empty();

  if(currentUser.favorites.length === 0){
    $favoriteStories.append("No favorites have been selected")
  }
  else{ 
    for(let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStories.append($story);
    }
  }
  $favoriteStories.show();
}

async function toggleFavorite(e) {
  console.debug("toggleFavorite")

  const $target = $(e.target)
  const $targetLi = $target.closest("li")
  const $targetId = $targetLi.attr("id")
  const story = storyList.stories.find(function (value) {
    return value.id === $targetId
  })
  console.log(story)
  if ($target.hasClass("fas")){
    await currentUser.removeFavorite(story)
    $target.closest("i").toggleClass("fas far")
  }
  else {
    await currentUser.addFavorite(story)
    $target.closest("i").toggleClass("fas far")
  }
}

$storiesList.on("click",".fav-icon",toggleFavorite)