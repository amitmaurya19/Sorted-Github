// Define global variable to store project data and current page
let projectData = [];
let currentPage = 1;
let isLoading = false; // To prevent multiple fetch calls

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Attach event listener for project search form submission
    document.getElementById('projectForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const topics = document.getElementById('topics').value.trim();
        if (topics === '') {
            alert('Please enter topics to search for projects.');
            return;
        }
        // Reset pagination and clear previous results
        currentPage = 1;
        projectData = [];
        document.getElementById('projects-container').innerHTML = '';
        fetchProjects(topics);
    });

    // Event listener for scroll
    window.addEventListener('scroll', () => {
        // Check if the user is near the bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            const topics = document.getElementById('topics').value.trim();
            if (topics !== '' && !isLoading) {
                fetchProjects(topics);
            }
        }
    });
});

// Function to show loading bar
function showLoadingBar() {
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.transform = 'scaleX(1)';
}

// Function to hide loading bar
function hideLoadingBar() {
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.transform = 'scaleX(0)';
}

// Function to fetch projects based on topics and page
async function fetchProjects(topics) {
    showLoadingBar();
    isLoading = true; // Set loading flag to true
    const apiUrl = `https://api.github.com/search/repositories?q=${topics}&per_page=10&page=${currentPage}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // If no items are returned, alert the user
        if (data.items.length === 0) {
            alert('No more projects found.');
            return;
        }

        projectData.push(...await Promise.all(data.items.map(async project => {
            const prResponse = await fetch(project.pulls_url.replace('{/number}', ''));
            const prData = await prResponse.json();
            const prCount = prData.length;
            return { ...project, prCount };
        })));

        // Increment the current page after successful fetch
        currentPage++;
        displayProjects(projectData);
    } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Failed to fetch projects. Please try again later.');
    } finally {
        hideLoadingBar();
        isLoading = false; // Reset loading flag
    }
}

// Function to display projects in the UI
function displayProjects(projects) {
    const resultsDiv = document.getElementById('projects-container');
    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('project');

        const title = document.createElement('h3');
        title.textContent = project.name;

        const description = document.createElement('p');
        description.textContent = project.description || 'No description available';

        const prCount = document.createElement('p');
        prCount.textContent = `Pull Requests: ${project.prCount}`;

        const link = document.createElement('a');
        link.href = project.html_url;
        link.target = '_blank';
        link.textContent = 'View on GitHub';

        projectDiv.appendChild(title);
        projectDiv.appendChild(description);
        projectDiv.appendChild(prCount);
        projectDiv.appendChild(link);

        resultsDiv.appendChild(projectDiv);
    });
}
