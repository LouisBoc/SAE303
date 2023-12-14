let scatterChart;
let myDoughnutChart; // Variable pour stocker l'instance du graphique
        const dataUrl = 'https://www.cril.univ-artois.fr/~lecoutre/teaching/jssae/code5/results.json';
        let currentSolver = ''; // Solver par défaut

        // Fonction pour mettre à jour le graphique en fonction du solver sélectionné
        async function updateChart() {
            currentSolver = document.getElementById('solverSelect').value;
            await buildAsync();
            await buildScatterChart();
            
        }

        
        //document.getElementById('name').innerHTML('cc');
        // Fonction pour obtenir une couleur aléatoire
        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        // Fonction pour construire et mettre à jour le graphique
        async function buildAsync() {
            try {
                // Récupérer les données JSON depuis l'URL
                const response = await fetch(dataUrl);
                const jsonData = await response.json();

                // Accéder aux données spécifiques
                const data = jsonData[2].data;

                const solverData = data.filter(entry => entry.name === currentSolver);

                // Créer un tableau pour stocker les états du solver sélectionné
                const solverStatusCounts = {
                    SAT: 0,
                    UNSAT: 0,
                    UNKNOWN: 0
                };

                // Compter le nombre d'occurrences de chaque état
                solverData.forEach(entry => {
                    switch (entry.status) {
                        case 'SAT':
                            solverStatusCounts.SAT++;
                            break;
                        case 'UNSAT':
                            solverStatusCounts.UNSAT++;
                            break;
                        case 'UNKNOWN':
                            solverStatusCounts.UNKNOWN++;
                            break;
                    }
                });

                // Préparer les données pour le graphique en anneau
                const statusLabels = Object.keys(solverStatusCounts);
                const statusData = Object.values(solverStatusCounts);

                // Créer ou mettre à jour le graphique en anneau avec Chart.js
                const ctx = document.getElementById('chartVariables').getContext('2d');
                if (myDoughnutChart) {
                    myDoughnutChart.destroy(); // Détruire le graphique existant
                }
                myDoughnutChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: statusLabels,
                        datasets: [{
                            data: statusData,
                            backgroundColor: statusLabels.map(getRandomColor),
                            borderColor: 'rgba(255, 255, 255, 1)',
                            borderWidth: 1
                        }]
                    },
    
                });
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
            }
        }

        async function buildScatterChart() {
            try {
                // Récupérer les données JSON depuis l'URL
                const response = await fetch(dataUrl);
                const jsonData = await response.json();

                // Accéder aux données spécifiques
                const data = jsonData[2].data;

                let solverData = data.filter(entry => entry.name === currentSolver);

                solverData = solverData.filter(entry => entry.status != 'UNKNOWN' && entry.status !='UNSAT');

                console.log(solverData);

                // Extraire les données nécessaires pour le graphique de dispersion
                const scatterData = solverData.map(entry => ({
                    x: entry.nb_variables,
                    y: entry.time,
                    label: entry.name
                }));

                // Créer ou mettre à jour le graphique de dispersion avec Chart.js
                const ctx = document.getElementById('scatterChart').getContext('2d');
                if (scatterChart) {
                    scatterChart.destroy(); // Détruire le graphique existant
                }
                scatterChart = new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            data: scatterData,
                            label: currentSolver,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)', // Couleur de fond des points
                            borderColor: 'rgba(75, 192, 192, 1)', // Couleur de la bordure des points
                            borderWidth: 1,
                            pointRadius: 8, // Taille des points
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'logarithmic',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: 'Nombre de variables'
                                }
                            },
                            y: {
                                type: 'logarithmic',
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Temps d\'exécution (s)'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom'
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
            }
        }


        // Fonction pour initialiser la liste déroulante des solvers
        async function initSolverSelect() {
            try {
                // Récupérer les données JSON depuis l'URL
                const response = await fetch(dataUrl);
                const jsonData = await response.json();

                // Accéder aux données spécifiques
                const data = jsonData[2].data;

                // Créer un ensemble pour stocker uniques noms de solvers
                const solverNamesSet = new Set();

                // Remplir l'ensemble avec les noms de solvers uniques
                data.forEach(entry => {
                    solverNamesSet.add(entry.name);
                });

                // Convertir l'ensemble en tableau
                const solverNamesArray = Array.from(solverNamesSet);

                // Trier les noms de solvers par ordre alphabétique
                solverNamesArray.sort();

                // Générer les options du menu déroulant
                const solverSelect = document.getElementById('solverSelect');
                solverNamesArray.forEach(solver => {
                    const option = document.createElement('option');
                    option.value = solver;
                    option.textContent = solver;
                    solverSelect.appendChild(option);
                });

                currentSolver = solverNamesArray[0];
                await buildAsync();
                await buildScatterChart(); 
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
            }
        }

        //console.log(currentSolver[0].name);
        // Appeler la fonction d'initialisation lors du chargement de la page
        initSolverSelect();
        //document.getElementById('name').innerHTML(currentSolver);