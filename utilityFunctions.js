function prettyPrint(string) {
    string = string.replace(/_/g, ' ');
    return string.substr(0,1).toUpperCase() + string.substr(1);
}