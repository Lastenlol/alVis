var arr = [5, 8, 1, 5, 3, 6, 34, 13, 4, 65, 83, 3, 12, 9];

var vis = new Visualizer($("#container"));
vis.loadElements(arr);

function heapSort(arr) {
    function pushDown(arr, first, last) {
        var i = first;
        while (i < parseInt(last / 2)) {
            var child = 2 * i + 1;

            if (child < last && arr[child] > arr[child + 1]) child++;
            if (arr[child] < arr[i]) {
                [arr[child], arr[i]] = [arr[i], arr[child]];
                vis.swapElements(child, i);
            }
            i = child;
        }
    }

    function buildInitialHeap(arr) {
        for (var i = parseInt(arr.length / 2) - 1; i >= 0; i--) {
            pushDown(arr, i, arr.length);
        }
    }

    buildInitialHeap(arr);
    for (var i = arr.length - 1; i >= 0; i--) {
        [arr[i], arr[0]] = [arr[0], arr[i]];
        vis.swapElements(i, 0);
        pushDown(arr, 0, i - 1);
    }
}


function selectSort(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        var iMin = i;
        vis.hightlight(i);
        for (var j = i + 1; j < arr.length; j++) {
            vis.hightlight(j);
            if (arr[j] < arr[iMin]) {
                if (iMin !== i) vis.cancelHightlight(iMin);
                iMin = j;
                vis.hightlight(iMin, {text: "white", background: "green"});
            } else vis.cancelHightlight(j);
        }
        [arr[i], arr[iMin]] = [arr[iMin], arr[i]];
        vis.swapElements(i, iMin);

        vis.cancelHightlight(iMin);
        vis.cancelHightlight(i);
    }
}


vis.buildRow();
// selectSort(arr);
vis.buildBinaryTree();
heapSort(arr);
