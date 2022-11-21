const CATEGORIES = ["Literature", "History", "Science", "Fine Arts", "Religion", "Mythology", "Philosophy", "Social Science", "Current Events", "Geography", "Other Academic", "Trash"];
const SUBCATEGORIES = {
    "Literature": ["American Literature", "British Literature", "Classical Literature", "European Literature", "World Literature", "Other Literature"],
    "History": ["American History", "Ancient History", "European History", "World History", "Other History"],
    "Science": ["Biology", "Chemistry", "Physics", "Math", "Other Science"],
    "Fine Arts": ["Visual Fine Arts", "Auditory Fine Arts", "Other Fine Arts"],
    "Religion": ["Religion"],
    "Mythology": ["Mythology"],
    "Philosophy": ["Philosophy"],
    "Social Science": ["Social Science"],
    "Current Events": ["Current Events"],
    "Geography": ["Geography"],
    "Other Academic": ["Other Academic"],
    "Trash": ["Trash"]
};
const SUBCATEGORIES_FLATTENED = ["American Literature", "British Literature", "Classical Literature", "European Literature", "World Literature", "Other Literature", "American History", "Ancient History", "European History", "World History", "Other History", "Biology", "Chemistry", "Physics", "Math", "Other Science", "Visual Fine Arts", "Auditory Fine Arts", "Other Fine Arts", "Religion", "Mythology", "Philosophy", "Social Science", "Current Events", "Geography", "Other Academic", "Trash"];

const CATEGORY_BUTTONS = [["Literature", "primary"], ["History", "success"], ["Science", "danger"], ["Fine Arts", "warning"], ["Religion", "secondary"], ["Mythology", "secondary"], ["Philosophy", "secondary"], ["Social Science", "secondary"], ["Current Events", "secondary"], ["Geography", "secondary"], ["Other Academic", "secondary"], ["Trash", "secondary"]];

const SUBCATEGORY_BUTTONS = [["American Literature", "primary"], ["British Literature", "primary"], ["Classical Literature", "primary"], ["European Literature", "primary"], ["World Literature", "primary"], ["Other Literature", "primary"], ["American History", "success"], ["Ancient History", "success"], ["European History", "success"], ["World History", "success"], ["Other History", "success"], ["Biology", "danger"], ["Chemistry", "danger"], ["Physics", "danger"], ["Math", "danger"], ["Other Science", "danger"], ["Visual Fine Arts", "warning"], ["Auditory Fine Arts", "warning"], ["Other Fine Arts", "warning"]];

var validCategories = [];
var validSubcategories = [];

function reportQuestion(_id, reason = "", description = "") {
    fetch('/api/report-question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: _id,
            reason: reason,
            description: description
        })
    }).then(response => {
        if (response.status === 200) {
            alert('Question has been reported.');
        } else {
            alert('There was an error reporting the question.');
        }
    }).catch(error => {
        alert('There was an error reporting the question.');
    });
}

document.getElementById('report-question-submit').addEventListener('click', function () {
    reportQuestion(document.getElementById('report-question-id').value, document.getElementById('report-question-reason').value, document.getElementById('report-question-description').value);
});

function rangeToArray(string, max = 0) {
    if (string.length === 0) {
        string = `1-${max}`;
    }

    if (string.endsWith('-')) {
        string = string + max;
    }

    let tokens = string.split(",");
    let ranges = [];
    for (let i = 0; i < tokens.length; i++) {
        let range = tokens[i].trim().split("-");
        if (range.length === 1) {
            ranges.push([parseInt(range[0]), parseInt(range[0])]);
        } else {
            ranges.push([parseInt(range[0]), parseInt(range[1])]);
        }
    }

    let array = [];
    for (let i = 0; i < ranges.length; i++) {
        for (let j = ranges[i][0]; j <= ranges[i][1]; j++) {
            array.push(j);
        }
    }

    return array;
}

function updateCategory(category, validCategories, validSubcategories) {
    if (validCategories.includes(category)) {
        validCategories = validCategories.filter(a => a !== category);
        validSubcategories = validSubcategories.filter(a => !SUBCATEGORIES[category].includes(a));
    } else {
        validCategories.push(category);
        validSubcategories = validSubcategories.concat(SUBCATEGORIES[category]);
    }

    return [validCategories, validSubcategories];
}

function updateSubcategory(subcategory, validSubcategories) {
    if (validSubcategories.includes(subcategory)) {
        validSubcategories = validSubcategories.filter(a => a !== subcategory);
    } else {
        validSubcategories.push(subcategory);
    }

    return validSubcategories;
}

/**
 * Updates the category modal to show the given categories and subcategories.
 * @param {Array<String>} validCategories
 * @param {Array<String>} validSubcategories
 * @returns {void}
 */
function loadCategoryModal(validCategories, validSubcategories) {
    document.querySelectorAll('#categories input').forEach(element => element.checked = false);
    document.querySelectorAll('#subcategories input').forEach(element => element.checked = false);
    document.querySelectorAll('#subcategories label').forEach(element => element.classList.add('d-none'));

    if (validSubcategories.length === 0) {
        let subcategoryInfoText = document.createElement('div');
        subcategoryInfoText.className = 'text-muted text-center';
        subcategoryInfoText.innerHTML = 'You must select categories before you can select subcategories.';
        subcategoryInfoText.id = 'subcategory-info-text';
        document.getElementById('subcategories').appendChild(subcategoryInfoText);
    } else if (document.getElementById('subcategory-info-text')) {
        document.getElementById('subcategory-info-text').remove();
    }

    validCategories.forEach(category => {
        document.getElementById(category).checked = true;
        SUBCATEGORIES[category].forEach(subcategory => {
            document.querySelector(`[for="${subcategory}"]`).classList.remove('d-none');
        });
    });

    validSubcategories.forEach(subcategory => {
        document.getElementById(subcategory).checked = true;
    });
}

class TossupCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const tossup = this.props.tossup;
        return React.createElement(
            "div",
            { className: "card my-2" },
            React.createElement(
                "div",
                { className: "card-header" },
                React.createElement(
                    "b",
                    null,
                    tossup.setName,
                    " | ",
                    tossup.category,
                    " | ",
                    tossup.subcategory
                ),
                React.createElement(
                    "b",
                    { className: "float-end" },
                    "Packet ",
                    tossup.packetNumber,
                    " | Question ",
                    tossup.questionNumber
                )
            ),
            React.createElement(
                "div",
                { className: "card-container" },
                React.createElement(
                    "div",
                    { className: "card-body" },
                    tossup.question,
                    "\xA0",
                    React.createElement(
                        "a",
                        { href: "#", onClick: () => {
                                document.getElementById('report-question-id').value = tossup._id;
                            }, id: `report-question-${tossup._id}`, "data-bs-toggle": "modal", "data-bs-target": "#report-question-modal" },
                        "Report Question"
                    ),
                    React.createElement("hr", null),
                    React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "b",
                            null,
                            "ANSWER:"
                        ),
                        " ",
                        React.createElement("span", { dangerouslySetInnerHTML: { __html: tossup.answer } })
                    )
                )
            )
        );
    }
}

class BonusCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const bonus = this.props.bonus;
        return React.createElement(
            "div",
            { className: "card my-2" },
            React.createElement(
                "div",
                { className: "card-header" },
                React.createElement(
                    "b",
                    null,
                    bonus.setName,
                    " | ",
                    bonus.category,
                    " | ",
                    bonus.subcategory
                ),
                React.createElement(
                    "b",
                    { className: "float-end" },
                    "Packet ",
                    bonus.packetNumber,
                    " | Question ",
                    bonus.questionNumber
                )
            ),
            React.createElement(
                "div",
                { className: "card-container" },
                React.createElement(
                    "div",
                    { className: "card-body" },
                    React.createElement(
                        "p",
                        null,
                        bonus.leadin
                    ),
                    [0, 1, 2].map(i => React.createElement(
                        "div",
                        null,
                        React.createElement("hr", null),
                        React.createElement(
                            "p",
                            null,
                            "[10] ",
                            bonus.parts[i]
                        ),
                        React.createElement(
                            "div",
                            null,
                            React.createElement(
                                "b",
                                null,
                                "ANSWER:"
                            ),
                            " ",
                            React.createElement("span", { dangerouslySetInnerHTML: { __html: bonus.answers[i] } })
                        )
                    ))
                )
            )
        );
    }
}

class CategoryModalButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement(
            "button",
            { type: "button", className: "btn btn-danger", id: "category-select-button", "data-bs-toggle": "modal", "data-bs-target": "#category-modal" },
            "Categories"
        );
    }
}

class CategoryButton extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.getElementById(this.props.category).addEventListener('click', e => {
            [validCategories, validSubcategories] = updateCategory(this.props.category, validCategories, validSubcategories);
            loadCategoryModal(validCategories, validSubcategories);
        });
    }

    render() {
        const category = this.props.category;
        return React.createElement(
            "div",
            null,
            React.createElement("input", { type: "checkbox", className: "btn-check", autoComplete: "off", id: category }),
            React.createElement(
                "label",
                { className: `btn btn-outline-${this.props.color} w-100 rounded-0 my-1`, htmlFor: category },
                category,
                React.createElement("br", null)
            )
        );
    }
}

class SubcategoryButton extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.getElementById(this.props.subcategory).addEventListener('click', e => {
            validSubcategories = updateSubcategory(this.props.subcategory, validSubcategories);
            loadCategoryModal(validCategories, validSubcategories);
        });
    }

    render() {
        const subcategory = this.props.subcategory;
        return React.createElement(
            "div",
            null,
            React.createElement("input", { type: "checkbox", className: "btn-check", autoComplete: "off", id: subcategory }),
            React.createElement(
                "label",
                { className: `btn btn-outline-${this.props.color} w-100 rounded-0 my-1`, htmlFor: subcategory },
                subcategory,
                React.createElement("br", null)
            )
        );
    }
}

class CategoryModal extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        loadCategoryModal(validCategories, validSubcategories);
    }

    render() {
        return React.createElement(
            "div",
            { className: "modal", id: "category-modal", tabIndex: "-1" },
            React.createElement(
                "div",
                { className: "modal-dialog modal-dialog-scrollable" },
                React.createElement(
                    "div",
                    { className: "modal-content" },
                    React.createElement(
                        "div",
                        { className: "modal-header" },
                        React.createElement(
                            "h5",
                            { className: "modal-title" },
                            "Select Categories and Subcategories"
                        ),
                        React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" })
                    ),
                    React.createElement(
                        "div",
                        { className: "modal-body" },
                        React.createElement(
                            "div",
                            { className: "row" },
                            React.createElement(
                                "div",
                                { className: "col-6", id: "categories" },
                                React.createElement(
                                    "h5",
                                    { className: "text-center" },
                                    "Categories"
                                ),
                                CATEGORY_BUTTONS.map(element => React.createElement(CategoryButton, { key: element[0], category: element[0], color: element[1] }))
                            ),
                            React.createElement(
                                "div",
                                { className: "col-6", id: "subcategories" },
                                React.createElement(
                                    "h5",
                                    { className: "text-center" },
                                    "Subcategories"
                                ),
                                SUBCATEGORY_BUTTONS.map(element => React.createElement(SubcategoryButton, { key: element[0], subcategory: element[0], color: element[1] }))
                            )
                        )
                    )
                )
            )
        );
    }
}

class QueryForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tossups: [],
            bonuses: [],

            tossupCount: 0,
            bonusCount: 0,

            difficulties: '',
            maxQueryReturnLength: '',
            queryString: '',
            questionType: 'all',
            searchType: 'all',

            currentlySearching: false
        };
        this.onDifficultyChange = this.onDifficultyChange.bind(this);
        this.onMaxQueryReturnLengthChange = this.onMaxQueryReturnLengthChange.bind(this);
        this.onQueryChange = this.onQueryChange.bind(this);
        this.onSearchTypeChange = this.onSearchTypeChange.bind(this);
        this.onQuestionTypeChange = this.onQuestionTypeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        fetch(`/api/set-list`).then(response => response.json()).then(data => {
            data.forEach(setName => {
                let option = document.createElement('option');
                option.innerHTML = setName;
                document.getElementById('set-list').appendChild(option);
            });
        });
    }

    onDifficultyChange(event) {
        this.setState({ difficulties: event.target.value });
    }

    onMaxQueryReturnLengthChange(event) {
        this.setState({ maxQueryReturnLength: event.target.value });
    }

    onQueryChange(event) {
        this.setState({ queryString: event.target.value });
    }

    onSearchTypeChange(event) {
        this.setState({ searchType: event.target.value });
    }

    onQuestionTypeChange(event) {
        this.setState({ questionType: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ currentlySearching: true });

        console.log('A query was submitted: ' + this.state.queryString);

        fetch(`/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categories: validCategories,
                subcategories: validSubcategories,
                difficulties: rangeToArray(this.state.difficulties),
                maxQueryReturnLength: this.state.maxQueryReturnLength,
                queryString: this.state.queryString,
                questionType: this.state.questionType,
                searchType: this.state.searchType,
                setName: document.getElementById('set-name').value
            })
        }).then(response => {
            if (response.status === 400) {
                throw new Error('Invalid query');
            }
            return response;
        }).then(response => response.json()).then(response => {
            const { tossups, bonuses } = response;
            let { count: tossupCount, questionArray: tossupArray } = tossups;
            for (let i = 0; i < tossupArray.length; i++) {
                if (tossupArray[i].hasOwnProperty('formatted_answer')) {
                    tossupArray[i].answer = tossupArray[i].formatted_answer;
                }
            }
            this.setState({ tossupCount: tossupCount });
            this.setState({ tossups: tossupArray });

            let { count: bonusCount, questionArray: bonusArray } = bonuses;
            for (let i = 0; i < bonusArray.length; i++) {
                if (bonusArray[i].hasOwnProperty('formatted_answers')) bonusArray[i].answers = bonusArray[i].formatted_answers;
            }
            this.setState({ bonusCount: bonusCount });
            this.setState({ bonuses: bonusArray });
            this.setState({ currentlySearching: false });
        }).catch(error => {
            console.error('Error:', error);
            alert('Invalid query. Please check your search parameters and try again.');
            this.setState({ currentlySearching: false });
        });
    }

    render() {
        const tossupCards = this.state.tossups.map(tossup => React.createElement(TossupCard, { key: tossup._id, tossup: tossup }));
        const bonusCards = this.state.bonuses.map(bonus => React.createElement(BonusCard, { key: bonus._id, bonus: bonus }));

        return React.createElement(
            "div",
            null,
            React.createElement(CategoryModal, null),
            React.createElement(
                "form",
                { className: "mt-3", onSubmit: this.handleSubmit },
                React.createElement(
                    "div",
                    { className: "input-group mb-2" },
                    React.createElement("input", { type: "text", className: "form-control", id: "query", placeholder: "Query", value: this.state.queryString, onChange: this.onQueryChange }),
                    React.createElement(
                        "button",
                        { type: "submit", className: "btn btn-info" },
                        "Search"
                    )
                ),
                React.createElement(
                    "div",
                    { className: "row mb-2" },
                    React.createElement(
                        "div",
                        { id: "difficulty-settings", className: "col-2" },
                        React.createElement("input", { type: "text", className: "form-control", id: "difficulties", placeholder: "Difficulties (1-10)", value: this.state.difficulties, onChange: this.onDifficultyChange })
                    ),
                    React.createElement(
                        "div",
                        { id: "max-query-length", className: "col-3" },
                        React.createElement("input", { type: "text", className: "form-control", id: "difficulties", placeholder: "Max # to Display (default: 50)", value: this.state.maxQueryReturnLength, onChange: this.onMaxQueryReturnLengthChange })
                    ),
                    React.createElement(
                        "div",
                        { className: "col-7" },
                        React.createElement("input", { type: "text", className: "form-control", id: "set-name", placeholder: "Set Name", list: "set-list" }),
                        React.createElement("datalist", { id: "set-list" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "row" },
                    React.createElement(
                        "div",
                        { className: "col-5" },
                        React.createElement(
                            "select",
                            { className: "form-select", id: "search-type", value: this.state.searchType, onChange: this.onSearchTypeChange },
                            React.createElement(
                                "option",
                                { value: "all" },
                                "All text (question and answer)"
                            ),
                            React.createElement(
                                "option",
                                { value: "question" },
                                "Question"
                            ),
                            React.createElement(
                                "option",
                                { value: "answer" },
                                "Answer"
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "col-5" },
                        React.createElement(
                            "select",
                            { className: "form-select disabled", id: "question-type", value: this.state.questionType, onChange: this.onQuestionTypeChange },
                            React.createElement(
                                "option",
                                { value: "all" },
                                "All questions (tossups and bonuses)"
                            ),
                            React.createElement(
                                "option",
                                { value: "tossup" },
                                "Tossups"
                            ),
                            React.createElement(
                                "option",
                                { value: "bonus" },
                                "Bonuses"
                            )
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "col-2" },
                        React.createElement(CategoryModalButton, null)
                    )
                )
            ),
            this.state.currentlySearching ? React.createElement(
                "div",
                { className: "d-block mx-auto mt-3 spinner-border", role: "status" },
                React.createElement(
                    "span",
                    { className: "d-none" },
                    "Loading..."
                )
            ) : null,
            React.createElement(
                "div",
                { className: "row text-center" },
                React.createElement(
                    "h3",
                    { className: "mt-3", id: "tossups" },
                    "Tossups"
                )
            ),
            this.state.tossupCount > 0 ? React.createElement(
                "p",
                null,
                React.createElement(
                    "div",
                    { className: "text-muted float-start" },
                    "Showing ",
                    this.state.tossups.length,
                    " out of ",
                    this.state.tossupCount,
                    " results"
                ),
                "\xA0",
                React.createElement(
                    "div",
                    { className: "text-muted float-end" },
                    React.createElement(
                        "a",
                        { href: "#bonuses" },
                        "Jump to bonuses"
                    )
                )
            ) : React.createElement(
                "p",
                { className: "text-muted" },
                "No tossups found"
            ),
            React.createElement(
                "div",
                null,
                tossupCards
            ),
            React.createElement("p", { className: "mb-5" }),
            React.createElement(
                "div",
                { className: "row text-center" },
                React.createElement(
                    "h3",
                    { className: "mt-3", id: "bonuses" },
                    "Bonuses"
                )
            ),
            this.state.bonusCount > 0 ? React.createElement(
                "p",
                null,
                React.createElement(
                    "div",
                    { className: "text-muted float-start" },
                    "Showing ",
                    this.state.bonuses.length,
                    " out of ",
                    this.state.bonusCount,
                    " results"
                ),
                "\xA0",
                React.createElement(
                    "div",
                    { className: "text-muted float-end" },
                    React.createElement(
                        "a",
                        { href: "#tossups" },
                        "Jump to tossups"
                    )
                )
            ) : React.createElement(
                "p",
                { className: "text-muted" },
                "No bonuses found"
            ),
            React.createElement(
                "div",
                null,
                bonusCards
            ),
            React.createElement("p", { className: "mb-5" })
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(QueryForm, null));
